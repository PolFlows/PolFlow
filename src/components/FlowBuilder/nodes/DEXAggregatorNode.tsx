import React, { useState, useEffect, memo } from 'react';
import { NodeProps, Position } from 'reactflow';
import { FaExchangeAlt } from 'react-icons/fa';
import BaseNode, { BaseNodeData } from './BaseNode';
import { usePolkadot } from '@/contexts/PolkadotContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useWallet } from '@/contexts/WalletContext';

// DEX aggregator node specific data
interface DEXAggregatorNodeData extends BaseNodeData {
  dexes: string[];
  selectedDexes: string[];
  slippageTolerance: string;
  routingStrategy: string;
  sourceToken?: string;
  targetToken?: string;
  amount?: string;
}

// DEX aggregator node component
const DEXAggregatorNode: React.FC<NodeProps<DEXAggregatorNodeData>> = ({ id, data, selected }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { api, activeChain } = usePolkadot();
  const { activeAccount, isConnected } = useWallet();
  
  // State for the node's properties
  const [selectedDexes, setSelectedDexes] = useState<string[]>(data.selectedDexes || ['HydraDX']);
  const [slippageTolerance, setSlippageTolerance] = useState<string>(data.slippageTolerance || '0.5');
  const [routingStrategy, setRoutingStrategy] = useState<string>(data.routingStrategy || 'best_price');
  const [sourceToken, setSourceToken] = useState<string>(data.sourceToken || 'DOT');
  const [targetToken, setTargetToken] = useState<string>(data.targetToken || 'USDC');
  const [amount, setAmount] = useState<string>(data.amount || '0');
  const [priceQuotes, setPriceQuotes] = useState<{ dex: string; price: string; impact: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [swapStatus, setSwapStatus] = useState<string>('');
  const [bestDex, setBestDex] = useState<string>('');

  // Available routing strategies
  const routingStrategies = [
    { value: 'best_price', label: 'Best Price' },
    { value: 'lowest_impact', label: 'Lowest Impact' },
    { value: 'fastest', label: 'Fastest Execution' },
    { value: 'split', label: 'Split Order' },
  ];

  // Available tokens based on the active chain
  const getAvailableTokens = () => {
    // This is a simplified implementation
    // In a real app, you would query the chain for available tokens
    const tokenMap: Record<string, string[]> = {
      'polkadot': ['DOT', 'USDT', 'USDC'],
      'kusama': ['KSM', 'USDT', 'USDC'],
      'asset-hub': ['DOT', 'USDT', 'USDC', 'WBTC', 'WETH'],
      'acala': ['ACA', 'LDOT', 'aUSD', 'DOT', 'USDT', 'USDC'],
      'moonbeam': ['GLMR', 'xcDOT', 'xcUSDT', 'WBTC', 'WETH'],
      'astar': ['ASTR', 'DOT', 'USDC', 'WBTC', 'WETH'],
      'hydradx': ['HDX', 'DOT', 'USDT', 'USDC', 'WBTC', 'WETH'],
    };
    
    return tokenMap[activeChain] || ['DOT', 'USDT', 'USDC'];
  };

  // Fetch price quotes when parameters change
  useEffect(() => {
    const fetchPriceQuotes = async () => {
      if (!isConnected || !api || !amount || parseFloat(amount) <= 0) {
        setPriceQuotes([]);
        setBestDex('');
        return;
      }
      
      setIsLoading(true);
      
      try {
        // This is a simplified implementation
        // In a real app, you would query each DEX for price quotes
        
        // Simulate API calls to different DEXs
        const mockQuotes = await Promise.all(selectedDexes.map(async (dex) => {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
          
          // Generate mock price based on DEX and tokens
          const basePrice = dex === 'HydraDX' ? 7.85 : dex === 'StellaSwap' ? 7.82 : 7.79;
          const randomFactor = 0.98 + Math.random() * 0.04; // Random factor between 0.98 and 1.02
          const price = (basePrice * randomFactor).toFixed(2);
          
          // Generate mock price impact
          const impact = (0.1 + Math.random() * 0.5).toFixed(2);
          
          return {
            dex,
            price,
            impact: `${impact}%`,
          };
        }));
        
        // Sort quotes by price (descending for sell, ascending for buy)
        const sortedQuotes = [...mockQuotes].sort((a, b) => {
          if (routingStrategy === 'best_price') {
            return parseFloat(b.price) - parseFloat(a.price); // Higher price is better when selling
          } else if (routingStrategy === 'lowest_impact') {
            return parseFloat(a.impact) - parseFloat(b.impact); // Lower impact is better
          }
          return 0;
        });
        
        setPriceQuotes(sortedQuotes);
        
        // Set the best DEX based on the routing strategy
        if (sortedQuotes.length > 0) {
          setBestDex(sortedQuotes[0].dex);
        }
      } catch (error) {
        console.error('Failed to fetch price quotes:', error);
        setPriceQuotes([]);
        setBestDex('');
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedDexes.length > 0 && sourceToken && targetToken) {
      fetchPriceQuotes();
    }
  }, [selectedDexes, sourceToken, targetToken, amount, routingStrategy, isConnected, api]);

  // Handle DEX selection change
  const handleDexChange = (dex: string) => {
    setSelectedDexes(prev => {
      if (prev.includes(dex)) {
        // Remove DEX if already selected
        const updated = prev.filter(d => d !== dex);
        data.selectedDexes = updated;
        return updated;
      } else {
        // Add DEX if not selected
        const updated = [...prev, dex];
        data.selectedDexes = updated;
        return updated;
      }
    });
  };

  // Handle slippage tolerance change
  const handleSlippageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setSlippageTolerance(value);
    data.slippageTolerance = value;
  };

  // Handle routing strategy change
  const handleRoutingStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoutingStrategy(e.target.value);
    data.routingStrategy = e.target.value;
  };

  // Handle source token change
  const handleSourceTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSourceToken(e.target.value);
    data.sourceToken = e.target.value;
  };

  // Handle target token change
  const handleTargetTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetToken(e.target.value);
    data.targetToken = e.target.value;
  };

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
    data.amount = value;
  };

  // Execute swap
  const handleSwap = async () => {
    if (!isConnected || !activeAccount || !api) {
      setSwapStatus('Not connected');
      return;
    }
    
    if (!bestDex) {
      setSwapStatus('No DEX selected');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setSwapStatus('Invalid amount');
      return;
    }
    
    setIsLoading(true);
    setSwapStatus('Preparing swap...');
    
    try {
      // This is a simplified implementation
      // In a real app, you would create and submit the actual swap transaction
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful swap
      setSwapStatus(`Swap executed on ${bestDex}: ${amount} ${sourceToken} → ${targetToken}`);
    } catch (error) {
      console.error('Swap error:', error);
      setSwapStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      nodeColor="#3b82f6" // Blue for DEX nodes
      icon={<FaExchangeAlt />}
      inputHandles={[{ id: 'input', position: Position.Left }]}
      outputHandles={[{ id: 'output', position: Position.Right }]}
    >
      <div className="space-y-3">
        {/* DEX selection */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">DEX Selection</label>
          <div className="flex flex-wrap gap-2">
            {data.dexes.map((dex) => (
              <button
                key={dex}
                className={`px-2 py-1 text-xs rounded-full ${
                  selectedDexes.includes(dex)
                    ? 'bg-blue-500 text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => handleDexChange(dex)}
              >
                {dex}
              </button>
            ))}
          </div>
        </div>

        {/* Token pair selection */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-sm font-medium block">From</label>
            <select
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={sourceToken}
              onChange={handleSourceTokenChange}
              disabled={isLoading}
            >
              {getAvailableTokens().map((token) => (
                <option key={`from-${token}`} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium block">To</label>
            <select
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={targetToken}
              onChange={handleTargetTokenChange}
              disabled={isLoading}
            >
              {getAvailableTokens().map((token) => (
                <option key={`to-${token}`} value={token} disabled={token === sourceToken}>
                  {token}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount input */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Amount</label>
          <div className="relative">
            <input
              type="text"
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.0"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm font-medium">
              {sourceToken}
            </div>
          </div>
        </div>

        {/* Routing strategy */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Routing Strategy</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={routingStrategy}
            onChange={handleRoutingStrategyChange}
            disabled={isLoading}
          >
            {routingStrategies.map((strategy) => (
              <option key={strategy.value} value={strategy.value}>
                {strategy.label}
              </option>
            ))}
          </select>
        </div>

        {/* Slippage tolerance */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Slippage Tolerance (%)</label>
            <span className="text-sm">{slippageTolerance}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            value={slippageTolerance}
            onChange={handleSlippageChange}
            disabled={isLoading}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0.1%</span>
            <span>5%</span>
          </div>
        </div>

        {/* Price quotes */}
        {priceQuotes.length > 0 && (
          <div className="space-y-1">
            <label className="text-sm font-medium block">Price Quotes</label>
            <div className={`text-xs space-y-1 max-h-24 overflow-y-auto p-1 rounded ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              {priceQuotes.map((quote, index) => (
                <div 
                  key={quote.dex} 
                  className={`flex justify-between p-1 rounded ${
                    quote.dex === bestDex 
                      ? isDark ? 'bg-blue-900' : 'bg-blue-100'
                      : ''
                  }`}
                >
                  <span>{quote.dex}</span>
                  <span>1 {sourceToken} = {quote.price} {targetToken}</span>
                  <span>Impact: {quote.impact}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Swap button */}
        <button
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            !isConnected || isLoading || !bestDex || !amount || parseFloat(amount) <= 0
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors duration-200`}
          onClick={handleSwap}
          disabled={!isConnected || isLoading || !bestDex || !amount || parseFloat(amount) <= 0}
        >
          {isLoading ? 'Processing...' : 'Execute Swap'}
        </button>

        {/* Swap status */}
        {swapStatus && (
          <div className={`text-xs ${
            swapStatus.startsWith('Swap executed')
              ? 'text-green-500'
              : swapStatus.startsWith('Error') || swapStatus.startsWith('Not')
              ? 'text-red-500'
              : isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {swapStatus}
          </div>
        )}

        {/* Best route indicator */}
        {bestDex && (
          <div className="text-xs text-green-500">
            Best route: {bestDex} ({routingStrategies.find(s => s.value === routingStrategy)?.label})
          </div>
        )}

        {/* Not connected warning */}
        {!isConnected && (
          <div className="text-xs text-amber-500">
            Connect a wallet to perform swaps
          </div>
        )}
      </div>
    </BaseNode>
  );
};

export default memo(DEXAggregatorNode);
