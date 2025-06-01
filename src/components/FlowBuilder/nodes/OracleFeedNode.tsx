import React, { useState, useEffect, useRef, memo } from 'react';
import { NodeProps, Position } from 'reactflow';
import { FaChartLine, FaSync } from 'react-icons/fa';
import BaseNode, { BaseNodeData } from './BaseNode';
import { useTheme } from '@/contexts/ThemeContext';
import { usePolkadot } from '@/contexts/PolkadotContext';
import { useWallet } from '@/contexts/WalletContext';

// Oracle feed node specific data
interface OracleFeedNodeData extends BaseNodeData {
  dataSource: string;
  updateFrequency: string;
  customEndpoint: string;
  dataType: string;
}

// Oracle feed node component for real-time price data
const OracleFeedNode: React.FC<NodeProps<OracleFeedNodeData>> = ({ id, data, selected }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { api, activeChain } = usePolkadot();
  const { isConnected } = useWallet();
  
  // State for the node's properties
  const [dataSource, setDataSource] = useState<string>(data.dataSource || 'Subscan');
  const [updateFrequency, setUpdateFrequency] = useState<string>(data.updateFrequency || '15s');
  const [customEndpoint, setCustomEndpoint] = useState<string>(data.customEndpoint || '');
  const [dataType, setDataType] = useState<string>(data.dataType || 'price');
  const [priceData, setPriceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Ref for the interval
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Available data sources
  const dataSources = [
    { value: 'Subscan', label: 'Subscan' },
    { value: 'OnFinality', label: 'OnFinality' },
    { value: 'Polkadot.js', label: 'Polkadot.js API' },
    { value: 'CoinGecko', label: 'CoinGecko' },
    { value: 'Custom', label: 'Custom Endpoint' },
  ];

  // Available update frequencies
  const updateFrequencies = [
    { value: '15s', label: '15 seconds' },
    { value: '30s', label: '30 seconds' },
    { value: '1m', label: '1 minute' },
    { value: '5m', label: '5 minutes' },
    { value: '15m', label: '15 minutes' },
    { value: '1h', label: '1 hour' },
  ];

  // Available data types
  const dataTypes = [
    { value: 'price', label: 'Price' },
    { value: 'volume', label: 'Trading Volume' },
    { value: 'marketCap', label: 'Market Cap' },
    { value: 'supply', label: 'Circulating Supply' },
    { value: 'liquidity', label: 'Liquidity' },
  ];

  // Convert update frequency string to milliseconds
  const getUpdateFrequencyMs = (freq: string): number => {
    const value = parseInt(freq.replace(/[^0-9]/g, ''));
    if (freq.includes('s')) return value * 1000;
    if (freq.includes('m')) return value * 60 * 1000;
    if (freq.includes('h')) return value * 60 * 60 * 1000;
    return 15000; // Default to 15 seconds
  };

  // Fetch price data from the selected source
  const fetchPriceData = async () => {
    if (!isConnected && dataSource !== 'CoinGecko' && dataSource !== 'Custom') {
      setError('Wallet connection required for on-chain data');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      let result;
      
      switch (dataSource) {
        case 'Subscan':
          result = await fetchFromSubscan();
          break;
        case 'OnFinality':
          result = await fetchFromOnFinality();
          break;
        case 'Polkadot.js':
          result = await fetchFromPolkadotJs();
          break;
        case 'CoinGecko':
          result = await fetchFromCoinGecko();
          break;
        case 'Custom':
          result = await fetchFromCustomEndpoint();
          break;
        default:
          throw new Error('Unknown data source');
      }
      
      setPriceData(result);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch price data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock implementations of data fetching functions
  const fetchFromSubscan = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data based on active chain and data type
    const chainSymbol = getChainSymbol();
    
    if (dataType === 'price') {
      return {
        value: (Math.random() * 100).toFixed(2),
        currency: 'USD',
        change24h: (Math.random() * 10 - 5).toFixed(2) + '%',
      };
    } else if (dataType === 'volume') {
      return {
        value: (Math.random() * 1000000).toFixed(0),
        currency: 'USD',
        change24h: (Math.random() * 20 - 10).toFixed(2) + '%',
      };
    } else if (dataType === 'marketCap') {
      return {
        value: (Math.random() * 10000000000).toFixed(0),
        currency: 'USD',
        rank: Math.floor(Math.random() * 100) + 1,
      };
    } else if (dataType === 'supply') {
      return {
        value: (Math.random() * 1000000000).toFixed(0),
        total: (Math.random() * 1000000000 + 1000000000).toFixed(0),
        percentage: (Math.random() * 100).toFixed(2) + '%',
      };
    } else {
      return {
        value: (Math.random() * 10000000).toFixed(0),
        currency: 'USD',
        depth: (Math.random() * 100).toFixed(2) + '%',
      };
    }
  };

  const fetchFromOnFinality = async () => {
    // Similar to Subscan but with different data format
    await new Promise(resolve => setTimeout(resolve, 700));
    
    if (dataType === 'price') {
      return {
        value: (Math.random() * 100).toFixed(2),
        currency: 'USD',
        source: 'OnFinality Oracle',
      };
    } else {
      // Similar mock data for other types
      return {
        value: (Math.random() * 1000000).toFixed(0),
        currency: 'USD',
        source: 'OnFinality Analytics',
      };
    }
  };

  const fetchFromPolkadotJs = async () => {
    if (!api) {
      throw new Error('Polkadot.js API not connected');
    }
    
    // Simulate on-chain query
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock data from on-chain oracle (if it existed)
    return {
      value: (Math.random() * 100).toFixed(2),
      currency: 'USD',
      blockNumber: await api.derive.chain.bestNumber(),
    };
  };

  const fetchFromCoinGecko = async () => {
    // Simulate API call to CoinGecko
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const chainSymbol = getChainSymbol();
    
    return {
      value: (Math.random() * 100).toFixed(2),
      currency: 'USD',
      marketRank: Math.floor(Math.random() * 100) + 1,
      source: 'CoinGecko',
    };
  };

  const fetchFromCustomEndpoint = async () => {
    if (!customEndpoint) {
      throw new Error('Custom endpoint URL is required');
    }
    
    // Simulate API call to custom endpoint
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Mock response
    return {
      value: (Math.random() * 100).toFixed(2),
      timestamp: new Date().toISOString(),
      source: 'Custom API',
    };
  };

  // Get symbol for the active chain
  const getChainSymbol = (): string => {
    const chainSymbols: Record<string, string> = {
      'polkadot': 'DOT',
      'kusama': 'KSM',
      'asset-hub': 'DOT',
      'acala': 'ACA',
      'moonbeam': 'GLMR',
      'astar': 'ASTR',
      'hydradx': 'HDX',
    };
    
    return chainSymbols[activeChain] || 'DOT';
  };

  // Set up the data fetching interval
  useEffect(() => {
    // Fetch data immediately
    fetchPriceData();
    
    // Set up interval for periodic updates
    const intervalMs = getUpdateFrequencyMs(updateFrequency);
    intervalRef.current = setInterval(fetchPriceData, intervalMs);
    
    // Clean up interval on unmount or when frequency changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dataSource, updateFrequency, customEndpoint, dataType, isConnected, api, activeChain]);

  // Update node data when properties change
  useEffect(() => {
    data.dataSource = dataSource;
    data.updateFrequency = updateFrequency;
    data.customEndpoint = customEndpoint;
    data.dataType = dataType;
  }, [data, dataSource, updateFrequency, customEndpoint, dataType]);

  // Handle data source change
  const handleDataSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDataSource(e.target.value);
  };

  // Handle update frequency change
  const handleUpdateFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUpdateFrequency(e.target.value);
    
    // Reset the interval with the new frequency
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const intervalMs = getUpdateFrequencyMs(e.target.value);
    intervalRef.current = setInterval(fetchPriceData, intervalMs);
  };

  // Handle custom endpoint change
  const handleCustomEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomEndpoint(e.target.value);
  };

  // Handle data type change
  const handleDataTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDataType(e.target.value);
  };

  // Format the time since last update
  const formatTimeSinceUpdate = (): string => {
    if (!lastUpdated) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    
    if (diffMs < 1000) return 'Just now';
    if (diffMs < 60000) return `${Math.floor(diffMs / 1000)}s ago`;
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
    
    return `${Math.floor(diffMs / 3600000)}h ago`;
  };

  // Manually refresh data
  const handleRefresh = () => {
    fetchPriceData();
  };

  // Format the price data for display
  const formatPriceData = (): string => {
    if (!priceData) return 'No data';
    
    if (dataType === 'price') {
      return `${priceData.value} ${priceData.currency || 'USD'}`;
    } else if (dataType === 'volume') {
      return `${formatLargeNumber(priceData.value)} ${priceData.currency || 'USD'}`;
    } else if (dataType === 'marketCap') {
      return `${formatLargeNumber(priceData.value)} ${priceData.currency || 'USD'}`;
    } else if (dataType === 'supply') {
      return `${formatLargeNumber(priceData.value)}`;
    } else {
      return `${formatLargeNumber(priceData.value)} ${priceData.currency || 'USD'}`;
    }
  };

  // Format large numbers with K, M, B suffixes
  const formatLargeNumber = (num: string | number): string => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
    
    return n.toString();
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      nodeColor="#0ea5e9" // Sky blue for oracle nodes
      icon={<FaChartLine />}
      inputHandles={[]}
      outputHandles={[{ id: 'output', position: Position.Right }]}
    >
      <div className="space-y-3">
        {/* Data source selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Data Source</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={dataSource}
            onChange={handleDataSourceChange}
            disabled={isLoading}
          >
            {dataSources.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom endpoint input (only if Custom is selected) */}
        {dataSource === 'Custom' && (
          <div className="space-y-1">
            <label className="text-sm font-medium block">API Endpoint URL</label>
            <input
              type="text"
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={customEndpoint}
              onChange={handleCustomEndpointChange}
              placeholder="https://api.example.com/prices"
              disabled={isLoading}
            />
          </div>
        )}

        {/* Data type selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Data Type</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={dataType}
            onChange={handleDataTypeChange}
            disabled={isLoading}
          >
            {dataTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Update frequency selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Update Frequency</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={updateFrequency}
            onChange={handleUpdateFrequencyChange}
            disabled={isLoading}
          >
            {updateFrequencies.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
        </div>

        {/* Data display */}
        <div className={`p-3 rounded-md ${
          isDark ? 'bg-gray-700' : 'bg-gray-100'
        } flex flex-col items-center justify-center`}>
          <div className="text-sm font-medium mb-1">
            {dataTypes.find(t => t.value === dataType)?.label || 'Data'} ({getChainSymbol()})
          </div>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <span className="flex items-center">
                <FaSync className="animate-spin mr-2" size={16} />
                Loading...
              </span>
            ) : error ? (
              <span className="text-red-500 text-sm">{error}</span>
            ) : (
              formatPriceData()
            )}
          </div>
          {priceData && priceData.change24h && (
            <div className={`text-sm ${
              priceData.change24h.startsWith('-') ? 'text-red-500' : 'text-green-500'
            }`}>
              {priceData.change24h}
            </div>
          )}
          {priceData && priceData.rank && (
            <div className="text-xs mt-1">
              Rank: #{priceData.rank}
            </div>
          )}
        </div>

        {/* Last updated and refresh button */}
        <div className="flex justify-between items-center text-xs">
          <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Updated: {formatTimeSinceUpdate()}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`flex items-center px-2 py-1 rounded ${
              isLoading
                ? isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                : isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <FaSync className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} size={10} />
            Refresh
          </button>
        </div>

        {/* Connection warning */}
        {!isConnected && dataSource !== 'CoinGecko' && dataSource !== 'Custom' && (
          <div className="text-xs text-amber-500">
            Connect a wallet for on-chain data
          </div>
        )}
      </div>
    </BaseNode>
  );
};

export default memo(OracleFeedNode);
