'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from './WalletContext';

// Define network types and endpoints
export type NetworkType = 'mainnet' | 'testnet' | 'local';
export type ChainType = 'polkadot' | 'kusama' | 'asset-hub' | 'acala' | 'moonbeam' | 'astar' | 'hydradx' | 'bifrost' | 'parallel';

// Network endpoints configuration
const NETWORK_ENDPOINTS: Record<NetworkType, Record<ChainType, string>> = {
  mainnet: {
    'polkadot': 'wss://rpc.polkadot.io',
    'kusama': 'wss://kusama-rpc.polkadot.io',
    'asset-hub': 'wss://polkadot-asset-hub-rpc.polkadot.io',
    'acala': 'wss://acala-rpc-0.aca-api.network',
    'moonbeam': 'wss://wss.api.moonbeam.network',
    'astar': 'wss://rpc.astar.network',
    'hydradx': 'wss://rpc.hydradx.cloud',
    'bifrost': 'wss://bifrost-rpc.liebi.com/ws',
    'parallel': 'wss://rpc.parallel.fi',
  },
  testnet: {
    'polkadot': 'wss://westend-rpc.polkadot.io',
    'kusama': 'wss://kusama-rpc.polkadot.io', // Using Kusama as testnet for simplicity
    'asset-hub': 'wss://westend-asset-hub-rpc.polkadot.io',
    'acala': 'wss://acala-dev.aca-dev.network/ws',
    'moonbeam': 'wss://wss.api.moonbase.moonbeam.network',
    'astar': 'wss://rpc.shibuya.astar.network',
    'hydradx': 'wss://rpc.basilisk.cloud',
    'bifrost': 'wss://bifrost-westend.liebi.com/ws',
    'parallel': 'wss://westmint-rpc.polkadot.io',
  },
  local: {
    'polkadot': 'ws://127.0.0.1:9944',
    'kusama': 'ws://127.0.0.1:9945',
    'asset-hub': 'ws://127.0.0.1:9946',
    'acala': 'ws://127.0.0.1:9947',
    'moonbeam': 'ws://127.0.0.1:9948',
    'astar': 'ws://127.0.0.1:9949',
    'hydradx': 'ws://127.0.0.1:9950',
    'bifrost': 'ws://127.0.0.1:9951',
    'parallel': 'ws://127.0.0.1:9952',
  },
};

// Interface for chain connection state
interface ChainConnection {
  api: any | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
}

// Interface for the Polkadot context state
interface PolkadotContextState {
  networkType: NetworkType;
  setNetworkType: (network: NetworkType) => void;
  api: any | null;
  chainApis: Record<ChainType, ChainConnection>;
  activeChain: ChainType;
  setActiveChain: (chain: ChainType) => void;
  connectToChain: (chain: ChainType) => Promise<boolean>;
  disconnectFromChain: (chain: ChainType) => void;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  getBalance: (address: string, chain?: ChainType) => Promise<string>;
  submitTransaction: (
    tx: any,
    account: any,
    chain?: ChainType
  ) => Promise<{ success: boolean; hash?: string; error?: string }>;
  estimateFee: (
    tx: any,
    chain?: ChainType
  ) => Promise<{ success: boolean; fee?: string; error?: string }>;
  getXcmDestinations: () => ChainType[];
  formatXcmDestination: (chain: ChainType) => string;
}

// Create the context with default values
const PolkadotContext = createContext<PolkadotContextState>({
  networkType: 'mainnet',
  setNetworkType: () => {},
  api: null,
  chainApis: {} as Record<ChainType, ChainConnection>,
  activeChain: 'polkadot',
  setActiveChain: () => {},
  connectToChain: async () => false,
  disconnectFromChain: () => {},
  isConnecting: false,
  isConnected: false,
  error: null,
  getBalance: async () => '0',
  submitTransaction: async () => ({ success: false, error: 'Context not initialized' }),
  estimateFee: async () => ({ success: false, error: 'Context not initialized' }),
  getXcmDestinations: () => [],
  formatXcmDestination: () => '',
});

// Initialize empty chain connections
const initializeChainConnections = (): Record<ChainType, ChainConnection> => {
  const chains: ChainType[] = [
    'polkadot', 'kusama', 'asset-hub', 'acala', 
    'moonbeam', 'astar', 'hydradx', 'bifrost', 'parallel'
  ];
  
  return chains.reduce((acc, chain) => {
    acc[chain] = {
      api: null,
      isConnecting: false,
      isConnected: false,
      error: null,
    };
    return acc;
  }, {} as Record<ChainType, ChainConnection>);
};

// Props for the PolkadotProvider component
interface PolkadotProviderProps {
  children: ReactNode;
  defaultNetwork?: NetworkType;
  defaultChain?: ChainType;
}

// The provider component that wraps the application
export const PolkadotProvider: React.FC<PolkadotProviderProps> = ({
  children,
  defaultNetwork = 'mainnet',
  defaultChain = 'polkadot',
}) => {
  const { activeAccount } = useWallet();
  const [networkType, setNetworkType] = useState<NetworkType>(defaultNetwork);
  const [activeChain, setActiveChain] = useState<ChainType>(defaultChain);
  const [chainApis, setChainApis] = useState<Record<ChainType, ChainConnection>>(initializeChainConnections());
  const [polkadotApi, setPolkadotApi] = useState<any>(null);
  const [polkadotUtils, setPolkadotUtils] = useState<any>(null);
  
  // Load Polkadot.js dependencies dynamically on the client side
  useEffect(() => {
    const loadPolkadotDependencies = async () => {
      try {
        // Dynamically import Polkadot.js dependencies
        const { ApiPromise, WsProvider } = await import('@polkadot/api');
        const { typesBundle } = await import('@polkadot/apps-config');
        const { web3FromAddress } = await import('@polkadot/extension-dapp');
        const { formatBalance } = await import('@polkadot/util');
        
        setPolkadotApi({ ApiPromise, WsProvider, typesBundle });
        setPolkadotUtils({ web3FromAddress, formatBalance });
        
        // Connect to the default chain after dependencies are loaded
        if (polkadotApi) {
          connectToChain(defaultChain);
        }
      } catch (error) {
        console.error('Failed to load Polkadot.js dependencies:', error);
      }
    };
    
    loadPolkadotDependencies();
    
    // Clean up connections when component unmounts
    return () => {
      Object.keys(chainApis).forEach((chain) => {
        disconnectFromChain(chain as ChainType);
      });
    };
  }, []);
  
  // Computed properties for the active chain
  const isConnecting = chainApis[activeChain]?.isConnecting || false;
  const isConnected = chainApis[activeChain]?.isConnected || false;
  const error = chainApis[activeChain]?.error || null;
  const api = chainApis[activeChain]?.api || null;

  // Reconnect when network type changes
  useEffect(() => {
    if (polkadotApi) {
      // Disconnect all current connections
      Object.keys(chainApis).forEach((chain) => {
        disconnectFromChain(chain as ChainType);
      });
      
      // Connect to the active chain with the new network type
      connectToChain(activeChain);
    }
  }, [networkType, polkadotApi]);

  // Connect to a specific chain
  const connectToChain = async (chain: ChainType): Promise<boolean> => {
    if (!polkadotApi) return false;
    
    try {
      // If already connecting or connected, return current state
      if (chainApis[chain]?.isConnecting) {
        return false;
      }
      
      if (chainApis[chain]?.isConnected && chainApis[chain]?.api) {
        return true;
      }
      
      // Update connecting state
      setChainApis((prev) => ({
        ...prev,
        [chain]: {
          ...prev[chain],
          isConnecting: true,
          error: null,
        },
      }));
      
      // Get the endpoint for the selected chain and network
      const endpoint = NETWORK_ENDPOINTS[networkType][chain];
      
      if (!endpoint) {
        throw new Error(`No endpoint found for ${chain} on ${networkType}`);
      }
      
      // Create a WebSocket provider
      const provider = new polkadotApi.WsProvider(endpoint);
      
      // Create API instance
      const api = await polkadotApi.ApiPromise.create({
        provider,
        typesBundle: polkadotApi.typesBundle,
      });
      
      // Wait for API to be ready
      await api.isReady;
      
      // Update state with connected API
      setChainApis((prev) => ({
        ...prev,
        [chain]: {
          api,
          isConnecting: false,
          isConnected: true,
          error: null,
        },
      }));
      
      // Initialize balance formatting
      if (polkadotUtils) {
        const properties = await api.rpc.system.properties();
        polkadotUtils.formatBalance.setDefaults({
          decimals: typeof properties.tokenDecimals.unwrapOr([12])[0] === 'object' 
            ? properties.tokenDecimals.unwrapOr([12])[0].toNumber() 
            : properties.tokenDecimals.unwrapOr([12])[0],
          unit: properties.tokenSymbol.unwrapOr(['DOT'])[0].toString(),
        });
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error connecting to chain';
      console.error(`Error connecting to ${chain}:`, errorMessage);
      
      setChainApis((prev) => ({
        ...prev,
        [chain]: {
          api: null,
          isConnecting: false,
          isConnected: false,
          error: errorMessage,
        },
      }));
      
      return false;
    }
  };

  // Disconnect from a specific chain
  const disconnectFromChain = (chain: ChainType) => {
    const api = chainApis[chain]?.api;
    
    if (api) {
      api.disconnect().catch((err: any) => {
        console.error(`Error disconnecting from ${chain}:`, err);
      });
    }
    
    setChainApis((prev) => ({
      ...prev,
      [chain]: {
        api: null,
        isConnecting: false,
        isConnected: false,
        error: null,
      },
    }));
  };

  // Get balance for an address on a specific chain
  const getBalance = async (address: string, chain = activeChain): Promise<string> => {
    if (!polkadotUtils) return '0';
    
    try {
      const api = chainApis[chain]?.api;
      
      if (!api || !chainApis[chain]?.isConnected) {
        await connectToChain(chain);
      }
      
      if (!api || !chainApis[chain]?.isConnected) {
        throw new Error(`Not connected to ${chain}`);
      }
      
      // Get account balance
      const { data: balance } = await api.query.system.account(address);
      
      // Format balance with proper decimals
      return polkadotUtils.formatBalance(balance.free, { withUnit: true, forceUnit: '-' });
    } catch (err) {
      console.error('Error getting balance:', err);
      return '0';
    }
  };

  // Submit a transaction
  const submitTransaction = async (
    tx: any,
    account: any,
    chain = activeChain
  ): Promise<{ success: boolean; hash?: string; error?: string }> => {
    if (!polkadotUtils) {
      return { success: false, error: 'Polkadot utilities not loaded' };
    }
    
    try {
      const api = chainApis[chain]?.api;
      
      if (!api || !chainApis[chain]?.isConnected) {
        await connectToChain(chain);
      }
      
      if (!api || !chainApis[chain]?.isConnected) {
        throw new Error(`Not connected to ${chain}`);
      }
      
      // Get the extension injector for the account
      const injector = await polkadotUtils.web3FromAddress(account.address);
      
      // Set the signer
      api.setSigner(injector.signer);
      
      // Submit the transaction
      const unsub = await tx.signAndSend(account.address, { signer: injector.signer }, (result: any) => {
        const { status, events = [], dispatchError } = result;
        
        if (status.isInBlock || status.isFinalized) {
          // Check for errors
          if (dispatchError) {
            let errorMessage: string;
            
            if (dispatchError.isModule) {
              // For module errors, we have the section and method
              const decoded = api.registry.findMetaError(dispatchError.asModule);
              errorMessage = `${decoded.section}.${decoded.method}: ${decoded.docs.join(' ')}`;
            } else {
              // Other errors
              errorMessage = dispatchError.toString();
            }
            
            unsub();
            return {
              success: false,
              hash: status.isFinalized ? status.asFinalized.toHex() : status.asInBlock.toHex(),
              error: errorMessage,
            };
          }
          
          // Transaction successful
          unsub();
          return {
            success: true,
            hash: status.isFinalized ? status.asFinalized.toHex() : status.asInBlock.toHex(),
          };
        }
        
        // Transaction still processing
        return {
          success: false,
          error: 'Transaction in progress',
        };
      });
      
      // Return initial status
      return {
        success: true,
        hash: 'pending',
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error submitting transaction';
      console.error('Transaction error:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Estimate transaction fee
  const estimateFee = async (
    tx: any,
    chain = activeChain
  ): Promise<{ success: boolean; fee?: string; error?: string }> => {
    if (!polkadotUtils) {
      return { success: false, error: 'Polkadot utilities not loaded' };
    }
    
    try {
      const api = chainApis[chain]?.api;
      
      if (!api || !chainApis[chain]?.isConnected) {
        await connectToChain(chain);
      }
      
      if (!api || !chainApis[chain]?.isConnected) {
        throw new Error(`Not connected to ${chain}`);
      }
      
      // Get payment info
      const info = await tx.paymentInfo(activeAccount?.address);
      
      // Format the fee
      const fee = polkadotUtils.formatBalance(info.partialFee, { withUnit: true, forceUnit: '-' });
      
      return {
        success: true,
        fee,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error estimating fee';
      console.error('Fee estimation error:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Get available XCM destinations for the active chain
  const getXcmDestinations = (): ChainType[] => {
    // This is a simplified implementation
    // In a real app, you would query the chain for HRMP channels
    
    // For Polkadot, all parachains are valid destinations
    if (activeChain === 'polkadot') {
      return ['asset-hub', 'acala', 'moonbeam', 'astar', 'hydradx', 'bifrost', 'parallel'];
    }
    
    // For parachains, Polkadot relay chain is always a valid destination
    if (activeChain !== 'kusama') {
      return ['polkadot'];
    }
    
    // For Kusama, return an empty array as it's not in our scope
    return [];
  };

  // Format a chain name for XCM destination
  const formatXcmDestination = (chain: ChainType): string => {
    // This is a simplified implementation
    // In a real app, you would use the actual parachain IDs
    
    const parachainIds: Record<ChainType, number> = {
      'polkadot': 0, // Relay chain
      'kusama': 0,   // Relay chain
      'asset-hub': 1000,
      'acala': 2000,
      'moonbeam': 2004,
      'astar': 2006,
      'hydradx': 2034,
      'bifrost': 2030,
      'parallel': 2012,
    };
    
    if (chain === 'polkadot' || chain === 'kusama') {
      return 'Relay Chain';
    }
    
    return `Parachain ${parachainIds[chain]}`;
  };

  // Provide the Polkadot context to children components
  return (
    <PolkadotContext.Provider
      value={{
        networkType,
        setNetworkType,
        api,
        chainApis,
        activeChain,
        setActiveChain,
        connectToChain,
        disconnectFromChain,
        isConnecting,
        isConnected,
        error,
        getBalance,
        submitTransaction,
        estimateFee,
        getXcmDestinations,
        formatXcmDestination,
      }}
    >
      {children}
    </PolkadotContext.Provider>
  );
};

// Custom hook for using the Polkadot context
export const usePolkadot = () => useContext(PolkadotContext);

export default PolkadotContext;
