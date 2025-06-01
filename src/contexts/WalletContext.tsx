'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { web3Accounts, web3Enable, web3FromSource, web3AccountsSubscribe, web3FromAddress } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta, InjectedExtension } from '@polkadot/extension-inject/types';
import { hexToU8a, isHex } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

// Define wallet types supported by the application
export type WalletType = 'Polkadot.js' | 'Talisman' | 'Nova' | 'SubWallet';

// Interface for the wallet context state
interface WalletContextState {
  isConnecting: boolean;
  isConnected: boolean;
  accounts: InjectedAccountWithMeta[];
  activeAccount: InjectedAccountWithMeta | null;
  extensions: InjectedExtension[];
  error: string | null;
  connect: (walletType?: WalletType) => Promise<boolean>;
  disconnect: () => void;
  setActiveAccount: (account: InjectedAccountWithMeta) => void;
  signPayload: (payload: any) => Promise<string>;
  formatAddress: (address: string, ss58Format?: number) => string;
}

// Create the context with default values
const WalletContext = createContext<WalletContextState>({
  isConnecting: false,
  isConnected: false,
  accounts: [],
  activeAccount: null,
  extensions: [],
  error: null,
  connect: async () => false,
  disconnect: () => {},
  setActiveAccount: () => {},
  signPayload: async () => '',
  formatAddress: (address) => address,
});

// Props for the WalletProvider component
interface WalletProviderProps {
  children: ReactNode;
  appName?: string;
  ss58Format?: number; // Default Polkadot format is 0
}

// The provider component that wraps the application
export const WalletProvider: React.FC<WalletProviderProps> = ({ 
  children, 
  appName = 'Polkadot DeFi Flow Platform',
  ss58Format = 0 // Default to Polkadot
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [activeAccount, setActiveAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [extensions, setExtensions] = useState<InjectedExtension[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribe, setUnsubscribe] = useState<null | (() => void)>(null);

  // Clean up subscriptions when component unmounts
  useEffect(() => {
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unsubscribe]);

  // Try to restore connection from localStorage
  useEffect(() => {
    const savedAccount = localStorage.getItem('activePolkadotAccount');
    if (savedAccount) {
      try {
        const accountData = JSON.parse(savedAccount);
        // Only try to reconnect if we have account data
        if (accountData && accountData.address) {
          connect();
        }
      } catch (err) {
        console.error('Failed to parse saved account data:', err);
        localStorage.removeItem('activePolkadotAccount');
      }
    }
  }, []);

  // When accounts change, try to restore the active account
  useEffect(() => {
    if (accounts.length > 0) {
      const savedAccount = localStorage.getItem('activePolkadotAccount');
      if (savedAccount) {
        try {
          const accountData = JSON.parse(savedAccount);
          const matchedAccount = accounts.find(acc => acc.address === accountData.address);
          if (matchedAccount) {
            setActiveAccount(matchedAccount);
          } else if (!activeAccount) {
            // If no match but we have accounts, set the first one as active
            setActiveAccount(accounts[0]);
          }
        } catch (err) {
          console.error('Failed to restore active account:', err);
          setActiveAccount(accounts[0]);
        }
      } else if (!activeAccount) {
        // If no saved account, set the first one as active
        setActiveAccount(accounts[0]);
      }
    }
  }, [accounts, activeAccount]);

  // Save active account to localStorage when it changes
  useEffect(() => {
    if (activeAccount) {
      localStorage.setItem('activePolkadotAccount', JSON.stringify({
        address: activeAccount.address,
        name: activeAccount.meta.name
      }));
    }
  }, [activeAccount]);

  // Connect to wallet extensions
  const connect = async (walletType?: WalletType): Promise<boolean> => {
    try {
      setIsConnecting(true);
      setError(null);

      // Define which extensions to enable based on walletType
      const extensionsToEnable = walletType 
        ? [walletType.toLowerCase().replace(' ', '').replace('.', '')] 
        : ['polkadot', 'talisman', 'nova', 'subwallet'];

      // Enable the specified extensions
      const enabledExtensions = await web3Enable(appName);
      
      if (enabledExtensions.length === 0) {
        throw new Error('No wallet extensions found. Please install Polkadot.js, Talisman, Nova, or SubWallet extension.');
      }

      // Filter extensions if a specific wallet type was requested
      const filteredExtensions = walletType
        ? enabledExtensions.filter(ext => 
            ext.name.toLowerCase().includes(walletType.toLowerCase().replace(' ', '').replace('.', '')))
        : enabledExtensions;
      
      if (walletType && filteredExtensions.length === 0) {
        throw new Error(`${walletType} extension not found or not enabled.`);
      }

      setExtensions(filteredExtensions);

      // Get accounts from the extensions
      const allAccounts = await web3Accounts();
      
      if (allAccounts.length === 0) {
        throw new Error('No accounts found. Please create or import an account in your wallet extension.');
      }

      // Set up subscription to account changes
      const unsubscribeFn = await web3AccountsSubscribe(accounts => {
        setAccounts(accounts);
      });

      setUnsubscribe(() => unsubscribeFn);
      setAccounts(allAccounts);
      setIsConnected(true);
      setIsConnecting(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error connecting to wallet';
      console.error('Wallet connection error:', errorMessage);
      setError(errorMessage);
      setIsConnecting(false);
      setIsConnected(false);
      return false;
    }
  };

  // Disconnect from wallet
  const disconnect = () => {
    if (unsubscribe) {
      unsubscribe();
      setUnsubscribe(null);
    }
    setAccounts([]);
    setActiveAccount(null);
    setIsConnected(false);
    localStorage.removeItem('activePolkadotAccount');
  };

  // Set the active account
  const handleSetActiveAccount = (account: InjectedAccountWithMeta) => {
    setActiveAccount(account);
  };

  // Sign a payload using the active account
  const signPayload = async (payload: any): Promise<string> => {
    if (!activeAccount) {
      throw new Error('No active account selected');
    }

    try {
      // Get the extension for the active account
      const injector = await web3FromAddress(activeAccount.address);
      
      // Request signature
      const signRaw = injector?.signer?.signRaw;
      
      if (!signRaw) {
        throw new Error('Signing is not supported by this wallet extension');
      }
      
      const { signature } = await signRaw({
        address: activeAccount.address,
        data: payload.data,
        type: payload.type
      });
      
      return signature;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during signing';
      console.error('Signing error:', errorMessage);
      throw new Error(`Failed to sign: ${errorMessage}`);
    }
  };

  // Format an address to the specified SS58 format
  const formatAddress = (address: string, format = ss58Format): string => {
    try {
      const publicKey = isHex(address)
        ? hexToU8a(address)
        : decodeAddress(address);
      
      return encodeAddress(publicKey, format);
    } catch (error) {
      console.error('Address formatting error:', error);
      return address; // Return original address if formatting fails
    }
  };

  // Provide the wallet context to children components
  return (
    <WalletContext.Provider
      value={{
        isConnecting,
        isConnected,
        accounts,
        activeAccount,
        extensions,
        error,
        connect,
        disconnect,
        setActiveAccount: handleSetActiveAccount,
        signPayload,
        formatAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook for using the wallet context
export const useWallet = () => useContext(WalletContext);

export default WalletContext;
