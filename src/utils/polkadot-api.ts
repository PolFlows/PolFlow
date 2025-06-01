import { ApiPromise } from '@polkadot/api';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { BN } from '@polkadot/util';
import { ChainType } from '@/contexts/PolkadotContext';

// Parachain-specific configuration
export interface ParachainConfig {
  name: string;
  displayName: string;
  logo: string;
  decimals: number;
  symbol: string;
  ss58Format: number;
  genesisHash: string;
  paraId?: number; // Undefined for relay chains
  relayChain?: 'polkadot' | 'kusama';
  testnet: boolean;
  color: string;
}

// Supported parachain configurations
export const PARACHAIN_CONFIGS: Record<ChainType, ParachainConfig> = {
  'polkadot': {
    name: 'polkadot',
    displayName: 'Polkadot',
    logo: '/assets/chains/polkadot.svg',
    decimals: 10,
    symbol: 'DOT',
    ss58Format: 0,
    genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3',
    testnet: false,
    color: '#E6007A'
  },
  'kusama': {
    name: 'kusama',
    displayName: 'Kusama',
    logo: '/assets/chains/kusama.svg',
    decimals: 12,
    symbol: 'KSM',
    ss58Format: 2,
    genesisHash: '0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe',
    testnet: false,
    color: '#000000'
  },
  'asset-hub': {
    name: 'asset-hub',
    displayName: 'Asset Hub',
    logo: '/assets/chains/asset-hub.svg',
    decimals: 10,
    symbol: 'DOT',
    ss58Format: 0,
    genesisHash: '0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f',
    paraId: 1000,
    relayChain: 'polkadot',
    testnet: false,
    color: '#77E3EF'
  },
  'acala': {
    name: 'acala',
    displayName: 'Acala',
    logo: '/assets/chains/acala.svg',
    decimals: 12,
    symbol: 'ACA',
    ss58Format: 10,
    genesisHash: '0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c',
    paraId: 2000,
    relayChain: 'polkadot',
    testnet: false,
    color: '#645AFF'
  },
  'moonbeam': {
    name: 'moonbeam',
    displayName: 'Moonbeam',
    logo: '/assets/chains/moonbeam.svg',
    decimals: 18,
    symbol: 'GLMR',
    ss58Format: 1284,
    genesisHash: '0xfe58ea77779b7abda7da4ec526d14db9b1e9cd40a217c34892af80a9b332b76d',
    paraId: 2004,
    relayChain: 'polkadot',
    testnet: false,
    color: '#53CBC9'
  },
  'astar': {
    name: 'astar',
    displayName: 'Astar',
    logo: '/assets/chains/astar.svg',
    decimals: 18,
    symbol: 'ASTR',
    ss58Format: 5,
    genesisHash: '0x9eb76c5184c4ab8679d2d5d819fdf90b9c001403e9e17da2e14b6d8aec4029c6',
    paraId: 2006,
    relayChain: 'polkadot',
    testnet: false,
    color: '#1B6DC1'
  },
  'hydradx': {
    name: 'hydradx',
    displayName: 'HydraDX',
    logo: '/assets/chains/hydradx.svg',
    decimals: 12,
    symbol: 'HDX',
    ss58Format: 63,
    genesisHash: '0xafdc188f45c71dacbaa0b62e16a91f726c7b8699a9748cdf715459de6b7f366d',
    paraId: 2034,
    relayChain: 'polkadot',
    testnet: false,
    color: '#5CCDEB'
  },
  'bifrost': {
    name: 'bifrost',
    displayName: 'Bifrost',
    logo: '/assets/chains/bifrost.svg',
    decimals: 12,
    symbol: 'BNC',
    ss58Format: 6,
    genesisHash: '0x262e1b2ad728475fd5de0855a4300001f968f33f8f6d28be30df8c690a93cc78',
    paraId: 2030,
    relayChain: 'polkadot',
    testnet: false,
    color: '#29ADFF'
  },
  'parallel': {
    name: 'parallel',
    displayName: 'Parallel',
    logo: '/assets/chains/parallel.svg',
    decimals: 12,
    symbol: 'PARA',
    ss58Format: 172,
    genesisHash: '0xe61a41c53f5dcd0beb09df93b34402aada44cb05117b71059cce40a2723a4e97',
    paraId: 2012,
    relayChain: 'polkadot',
    testnet: false,
    color: '#EF18AC'
  }
};

// Token metadata interface
export interface TokenMetadata {
  symbol: string;
  name: string;
  decimals: number;
  address?: string; // For EVM-compatible chains
  referenceAsset?: string; // For wrapped assets, e.g., xcDOT references DOT
  logo?: string;
  isNative: boolean;
  isStablecoin: boolean;
}

// DEX interface
export interface DexInfo {
  name: string;
  logo: string;
  supportedChains: ChainType[];
  website: string;
  hasRouter: boolean;
}

// Available DEXes
export const SUPPORTED_DEXES: DexInfo[] = [
  {
    name: 'HydraDX',
    logo: '/assets/dexes/hydradx.svg',
    supportedChains: ['hydradx'],
    website: 'https://hydradx.io',
    hasRouter: true
  },
  {
    name: 'StellaSwap',
    logo: '/assets/dexes/stellaswap.svg',
    supportedChains: ['moonbeam'],
    website: 'https://stellaswap.com',
    hasRouter: true
  },
  {
    name: 'Beamswap',
    logo: '/assets/dexes/beamswap.svg',
    supportedChains: ['moonbeam'],
    website: 'https://beamswap.io',
    hasRouter: true
  },
  {
    name: 'Acala Swap',
    logo: '/assets/dexes/acala.svg',
    supportedChains: ['acala'],
    website: 'https://acala.network',
    hasRouter: false
  },
  {
    name: 'Arthswap',
    logo: '/assets/dexes/arthswap.svg',
    supportedChains: ['astar'],
    website: 'https://arthswap.org',
    hasRouter: true
  }
];

// XCM transfer parameters
export interface XcmTransferParams {
  sourceChain: ChainType;
  destinationChain: ChainType;
  recipientAddress: string;
  amount: string | BN;
  token: string;
  feeAsset?: string;
}

// Price quote interface
export interface PriceQuote {
  dex: string;
  inputAmount: string;
  outputAmount: string;
  price: string;
  priceImpact: string;
  fee: string;
  route: string[];
}

/**
 * Parachain API service for managing parachain-specific functionality
 */
export class ParachainApiService {
  private apis: Map<ChainType, ApiPromise> = new Map();
  
  /**
   * Set the API instance for a specific chain
   * @param chain The chain type
   * @param api The API instance
   */
  setApi(chain: ChainType, api: ApiPromise): void {
    this.apis.set(chain, api);
  }
  
  /**
   * Get the API instance for a specific chain
   * @param chain The chain type
   * @returns The API instance or undefined if not connected
   */
  getApi(chain: ChainType): ApiPromise | undefined {
    return this.apis.get(chain);
  }
  
  /**
   * Check if a chain is connected
   * @param chain The chain type
   * @returns True if connected, false otherwise
   */
  isConnected(chain: ChainType): boolean {
    const api = this.apis.get(chain);
    return !!api && api.isConnected;
  }
  
  /**
   * Get the configuration for a specific chain
   * @param chain The chain type
   * @returns The chain configuration
   */
  getChainConfig(chain: ChainType): ParachainConfig {
    return PARACHAIN_CONFIGS[chain];
  }
  
  /**
   * Get tokens supported by a specific chain
   * @param chain The chain type
   * @returns Map of token symbols to metadata
   */
  async getSupportedTokens(chain: ChainType): Promise<Map<string, TokenMetadata>> {
    const tokens = new Map<string, TokenMetadata>();
    const api = this.apis.get(chain);
    
    if (!api) {
      throw new Error(`Not connected to ${chain}`);
    }
    
    // Add native token
    const config = this.getChainConfig(chain);
    tokens.set(config.symbol, {
      symbol: config.symbol,
      name: config.displayName,
      decimals: config.decimals,
      logo: config.logo,
      isNative: true,
      isStablecoin: false
    });
    
    // Add chain-specific tokens
    switch (chain) {
      case 'acala':
        tokens.set('LDOT', {
          symbol: 'LDOT',
          name: 'Liquid DOT',
          decimals: 10,
          isNative: false,
          isStablecoin: false,
          referenceAsset: 'DOT'
        });
        tokens.set('aUSD', {
          symbol: 'aUSD',
          name: 'Acala USD',
          decimals: 12,
          isNative: false,
          isStablecoin: true
        });
        break;
        
      case 'asset-hub':
        tokens.set('USDT', {
          symbol: 'USDT',
          name: 'Tether USD',
          decimals: 6,
          isNative: false,
          isStablecoin: true
        });
        tokens.set('USDC', {
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          isNative: false,
          isStablecoin: true
        });
        break;
        
      case 'moonbeam':
        tokens.set('xcDOT', {
          symbol: 'xcDOT',
          name: 'XC DOT',
          decimals: 10,
          address: '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080',
          isNative: false,
          isStablecoin: false,
          referenceAsset: 'DOT'
        });
        tokens.set('xcUSDT', {
          symbol: 'xcUSDT',
          name: 'XC USDT',
          decimals: 6,
          address: '0xFFFFFFfFFFfffFFfFFfFFFFFffFFFffffFfFFFfF',
          isNative: false,
          isStablecoin: true,
          referenceAsset: 'USDT'
        });
        break;
        
      // Add more chains as needed
    }
    
    return tokens;
  }
  
  /**
   * Get DEXes supported by a specific chain
   * @param chain The chain type
   * @returns Array of supported DEXes
   */
  getSupportedDexes(chain: ChainType): DexInfo[] {
    return SUPPORTED_DEXES.filter(dex => dex.supportedChains.includes(chain));
  }
  
  /**
   * Execute an XCM transfer between chains
   * @param params XCM transfer parameters
   * @param account The account to sign the transaction
   * @returns Transaction hash if successful
   */
  async executeXcmTransfer(
    params: XcmTransferParams,
    account: InjectedAccountWithMeta
  ): Promise<string> {
    const { sourceChain, destinationChain, recipientAddress, amount, token } = params;
    const sourceApi = this.apis.get(sourceChain);
    
    if (!sourceApi) {
      throw new Error(`Not connected to ${sourceChain}`);
    }
    
    const sourceConfig = this.getChainConfig(sourceChain);
    const destConfig = this.getChainConfig(destinationChain);
    
    // Check if destination is a parachain
    if (!destConfig.paraId) {
      throw new Error(`Destination chain ${destinationChain} is not a parachain`);
    }
    
    try {
      // Create XCM transfer transaction based on source chain
      let tx;
      
      if (sourceChain === 'polkadot' || sourceChain === 'kusama') {
        // Transfer from relay chain to parachain
        tx = sourceApi.tx.xcmPallet.reserveTransferAssets(
          { V3: { parents: 0, interior: { X1: { Parachain: destConfig.paraId } } } }, // Destination
          { V3: { parents: 0, interior: { X1: { AccountId32: { network: 'Any', id: recipientAddress } } } } }, // Beneficiary
          { V3: [{ id: { Concrete: { parents: 0, interior: 'Here' } }, fun: { Fungible: amount } }] }, // Assets
          0 // Fee index
        );
      } else if (destConfig.relayChain === sourceConfig.relayChain) {
        // Transfer between parachains on the same relay chain
        tx = sourceApi.tx.polkadotXcm.limitedReserveTransferAssets(
          { V3: { parents: 1, interior: { X1: { Parachain: destConfig.paraId } } } }, // Destination
          { V3: { parents: 0, interior: { X1: { AccountId32: { network: 'Any', id: recipientAddress } } } } }, // Beneficiary
          { V3: [{ id: { Concrete: { parents: 0, interior: 'Here' } }, fun: { Fungible: amount } }] }, // Assets
          0, // Fee index
          'Unlimited' // Weight limit
        );
      } else {
        throw new Error(`XCM transfer from ${sourceChain} to ${destinationChain} not supported`);
      }
      
      // Sign and send the transaction
      return new Promise((resolve, reject) => {
        tx.signAndSend(account.address, { signer: window.injectedWeb3[account.meta.source].signer }, ({ status, events, dispatchError }) => {
          if (status.isInBlock || status.isFinalized) {
            if (dispatchError) {
              if (dispatchError.isModule) {
                const decoded = sourceApi.registry.findMetaError(dispatchError.asModule);
                reject(new Error(`${decoded.section}.${decoded.method}: ${decoded.docs}`));
              } else {
                reject(new Error(dispatchError.toString()));
              }
            } else {
              // Find the ExtrinsicSuccess event
              const successEvent = events.find(({ event }) => 
                sourceApi.events.system.ExtrinsicSuccess.is(event)
              );
              
              if (successEvent) {
                resolve(status.isFinalized ? status.asFinalized.toHex() : status.asInBlock.toHex());
              } else {
                reject(new Error('Transaction failed'));
              }
            }
          }
        }).catch(reject);
      });
    } catch (error) {
      console.error('XCM transfer error:', error);
      throw error;
    }
  }
  
  /**
   * Get price quotes from DEXes on a specific chain
   * @param chain The chain type
   * @param fromToken Source token symbol
   * @param toToken Destination token symbol
   * @param amount Amount to swap (in source token's smallest unit)
   * @returns Array of price quotes from different DEXes
   */
  async getPriceQuotes(
    chain: ChainType,
    fromToken: string,
    toToken: string,
    amount: string | BN
  ): Promise<PriceQuote[]> {
    const api = this.apis.get(chain);
    
    if (!api) {
      throw new Error(`Not connected to ${chain}`);
    }
    
    const supportedDexes = this.getSupportedDexes(chain);
    
    if (supportedDexes.length === 0) {
      throw new Error(`No DEXes supported on ${chain}`);
    }
    
    // Get quotes from each DEX
    const quotePromises = supportedDexes.map(async (dex) => {
      try {
        // Chain-specific DEX quote logic
        switch (chain) {
          case 'hydradx':
            if (dex.name === 'HydraDX') {
              // Use HydraDX Omnipool for quotes
              const assetIn = this.getAssetId(chain, fromToken);
              const assetOut = this.getAssetId(chain, toToken);
              
              // Mock implementation - in a real app, you would call the actual API
              const mockOutputAmount = new BN(amount.toString()).muln(Math.floor(Math.random() * 100) + 900).divn(1000);
              const mockPrice = (Math.random() * 10 + 1).toFixed(4);
              const mockImpact = (Math.random() * 2).toFixed(2);
              
              return {
                dex: dex.name,
                inputAmount: amount.toString(),
                outputAmount: mockOutputAmount.toString(),
                price: mockPrice,
                priceImpact: mockImpact + '%',
                fee: '0.3%',
                route: [fromToken, toToken]
              };
            }
            break;
            
          case 'moonbeam':
            // For EVM-compatible chains like Moonbeam
            // In a real implementation, you would use ethers.js to interact with DEX contracts
            
            // Mock implementation
            const mockOutputAmount = new BN(amount.toString()).muln(Math.floor(Math.random() * 100) + 900).divn(1000);
            const mockPrice = (Math.random() * 10 + 1).toFixed(4);
            const mockImpact = (Math.random() * 2).toFixed(2);
            
            return {
              dex: dex.name,
              inputAmount: amount.toString(),
              outputAmount: mockOutputAmount.toString(),
              price: mockPrice,
              priceImpact: mockImpact + '%',
              fee: dex.name === 'StellaSwap' ? '0.25%' : '0.3%',
              route: [fromToken, toToken]
            };
            
          case 'acala':
            if (dex.name === 'Acala Swap') {
              // Use Acala Swap for quotes
              // Mock implementation
              const mockOutputAmount = new BN(amount.toString()).muln(Math.floor(Math.random() * 100) + 900).divn(1000);
              const mockPrice = (Math.random() * 10 + 1).toFixed(4);
              const mockImpact = (Math.random() * 2).toFixed(2);
              
              return {
                dex: dex.name,
                inputAmount: amount.toString(),
                outputAmount: mockOutputAmount.toString(),
                price: mockPrice,
                priceImpact: mockImpact + '%',
                fee: '0.3%',
                route: [fromToken, toToken]
              };
            }
            break;
            
          // Add more chains as needed
        }
        
        throw new Error(`Quote not implemented for ${dex.name} on ${chain}`);
      } catch (error) {
        console.error(`Failed to get quote from ${dex.name}:`, error);
        return null;
      }
    });
    
    // Filter out failed quotes
    const quotes = (await Promise.all(quotePromises)).filter(Boolean) as PriceQuote[];
    
    // Sort by output amount (best price first)
    return quotes.sort((a, b) => {
      const aAmount = new BN(a.outputAmount);
      const bAmount = new BN(b.outputAmount);
      return bAmount.cmp(aAmount);
    });
  }
  
  /**
   * Execute a swap on a specific DEX
   * @param chain The chain type
   * @param dexName The DEX name
   * @param fromToken Source token symbol
   * @param toToken Destination token symbol
   * @param amount Amount to swap (in source token's smallest unit)
   * @param slippageTolerance Slippage tolerance in percentage (e.g., 0.5 for 0.5%)
   * @param account The account to sign the transaction
   * @returns Transaction hash if successful
   */
  async executeSwap(
    chain: ChainType,
    dexName: string,
    fromToken: string,
    toToken: string,
    amount: string | BN,
    slippageTolerance: number,
    account: InjectedAccountWithMeta
  ): Promise<string> {
    const api = this.apis.get(chain);
    
    if (!api) {
      throw new Error(`Not connected to ${chain}`);
    }
    
    const dex = this.getSupportedDexes(chain).find(d => d.name === dexName);
    
    if (!dex) {
      throw new Error(`DEX ${dexName} not supported on ${chain}`);
    }
    
    try {
      // Chain-specific swap logic
      switch (chain) {
        case 'hydradx':
          if (dexName === 'HydraDX') {
            const assetIn = this.getAssetId(chain, fromToken);
            const assetOut = this.getAssetId(chain, toToken);
            
            // Get a quote to calculate minimum output
            const quotes = await this.getPriceQuotes(chain, fromToken, toToken, amount);
            const quote = quotes.find(q => q.dex === dexName);
            
            if (!quote) {
              throw new Error(`No quote available for ${dexName}`);
            }
            
            // Calculate minimum output with slippage
            const outputAmount = new BN(quote.outputAmount);
            const minOutputAmount = outputAmount.muln(10000 - Math.floor(slippageTolerance * 100)).divn(10000);
            
            // Create swap transaction
            const tx = api.tx.omnipool.sell(assetIn, assetOut, amount, minOutputAmount, false);
            
            // Sign and send the transaction
            return new Promise((resolve, reject) => {
              tx.signAndSend(account.address, { signer: window.injectedWeb3[account.meta.source].signer }, ({ status, events, dispatchError }) => {
                if (status.isInBlock || status.isFinalized) {
                  if (dispatchError) {
                    if (dispatchError.isModule) {
                      const decoded = api.registry.findMetaError(dispatchError.asModule);
                      reject(new Error(`${decoded.section}.${decoded.method}: ${decoded.docs}`));
                    } else {
                      reject(new Error(dispatchError.toString()));
                    }
                  } else {
                    resolve(status.isFinalized ? status.asFinalized.toHex() : status.asInBlock.toHex());
                  }
                }
              }).catch(reject);
            });
          }
          break;
          
        case 'acala':
          if (dexName === 'Acala Swap') {
            // Get token currency IDs
            const currencyIdIn = this.getCurrencyId(chain, fromToken);
            const currencyIdOut = this.getCurrencyId(chain, toToken);
            
            // Get a quote to calculate minimum output
            const quotes = await this.getPriceQuotes(chain, fromToken, toToken, amount);
            const quote = quotes.find(q => q.dex === dexName);
            
            if (!quote) {
              throw new Error(`No quote available for ${dexName}`);
            }
            
            // Calculate minimum output with slippage
            const outputAmount = new BN(quote.outputAmount);
            const minOutputAmount = outputAmount.muln(10000 - Math.floor(slippageTolerance * 100)).divn(10000);
            
            // Create swap transaction
            const tx = api.tx.dex.swapWithExactSupply(
              [currencyIdIn, currencyIdOut],
              amount,
              minOutputAmount
            );
            
            // Sign and send the transaction
            return new Promise((resolve, reject) => {
              tx.signAndSend(account.address, { signer: window.injectedWeb3[account.meta.source].signer }, ({ status, events, dispatchError }) => {
                if (status.isInBlock || status.isFinalized) {
                  if (dispatchError) {
                    if (dispatchError.isModule) {
                      const decoded = api.registry.findMetaError(dispatchError.asModule);
                      reject(new Error(`${decoded.section}.${decoded.method}: ${decoded.docs}`));
                    } else {
                      reject(new Error(dispatchError.toString()));
                    }
                  } else {
                    resolve(status.isFinalized ? status.asFinalized.toHex() : status.asInBlock.toHex());
                  }
                }
              }).catch(reject);
            });
          }
          break;
          
        // Add more chains as needed
          
        default:
          throw new Error(`Swap not implemented for ${chain}`);
      }
      
      throw new Error(`Swap not implemented for ${dexName} on ${chain}`);
    } catch (error) {
      console.error('Swap error:', error);
      throw error;
    }
  }
  
  /**
   * Get the asset ID for a token on a specific chain
   * @param chain The chain type
   * @param token The token symbol
   * @returns The asset ID
   */
  private getAssetId(chain: ChainType, token: string): any {
    // Chain-specific asset ID mapping
    switch (chain) {
      case 'hydradx':
        // Mock implementation - in a real app, you would use actual asset IDs
        if (token === 'HDX') return { 'Native': null };
        if (token === 'DOT') return { 'ForeignAsset': 0 };
        if (token === 'USDT') return { 'ForeignAsset': 1 };
        if (token === 'USDC') return { 'ForeignAsset': 2 };
        break;
        
      // Add more chains as needed
    }
    
    throw new Error(`Asset ID not found for ${token} on ${chain}`);
  }
  
  /**
   * Get the currency ID for a token on a specific chain
   * @param chain The chain type
   * @param token The token symbol
   * @returns The currency ID
   */
  private getCurrencyId(chain: ChainType, token: string): any {
    // Chain-specific currency ID mapping
    switch (chain) {
      case 'acala':
        // Mock implementation - in a real app, you would use actual currency IDs
        if (token === 'ACA') return { 'Token': 'ACA' };
        if (token === 'LDOT') return { 'Token': 'LDOT' };
        if (token === 'DOT') return { 'Token': 'DOT' };
        if (token === 'aUSD') return { 'Token': 'AUSD' };
        break;
        
      // Add more chains as needed
    }
    
    throw new Error(`Currency ID not found for ${token} on ${chain}`);
  }
}

// Create a singleton instance
export const parachainApi = new ParachainApiService();

export default parachainApi;
