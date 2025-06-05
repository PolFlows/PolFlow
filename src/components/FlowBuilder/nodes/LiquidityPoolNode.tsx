import React, { useState, useEffect, memo } from 'react';
import { NodeProps, Position } from 'reactflow';
import { FaWater } from 'react-icons/fa';
import BaseNode, { BaseNodeData } from './BaseNode';
import { usePolkadot } from '@/contexts/PolkadotContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useWallet } from '@/contexts/WalletContext';

// Liquidity pool node specific data
interface LiquidityPoolNodeData extends BaseNodeData {
  poolType: string;
  pairA: string;
  pairB: string;
  stakingPeriod: string;
  autoCompound: boolean;
  ratio?: string;
  impermanentLossProtection?: boolean;
}

// Liquidity pool node component
const LiquidityPoolNode: React.FC<NodeProps<LiquidityPoolNodeData>> = ({ id, data, selected }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { api, activeChain } = usePolkadot();
  const { activeAccount, isConnected } = useWallet();
  
  // State for the node's properties
  const [poolType, setPoolType] = useState<string>(data.poolType || '50_50');
  const [pairA, setPairA] = useState<string>(data.pairA || 'DOT');
  const [pairB, setPairB] = useState<string>(data.pairB || 'USDC');
  const [stakingPeriod, setStakingPeriod] = useState<string>(data.stakingPeriod || '0');
  const [autoCompound, setAutoCompound] = useState<boolean>(data.autoCompound || false);
  const [ratio, setRatio] = useState<string>(data.ratio || '50');
  const [impermanentLossProtection, setImpermanentLossProtection] = useState<boolean>(
    data.impermanentLossProtection || false
  );
  
  const [poolInfo, setPoolInfo] = useState<{
    totalLiquidity: string;
    apr: string;
    volume24h: string;
    userLiquidity: string;
    rewards: string;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionStatus, setActionStatus] = useState<string>('');

  // Available pool types
  const poolTypes = [
    { value: '50_50', label: '50/50 Standard' },
    { value: '80_20', label: '80/20 Weighted' },
    { value: 'stable', label: 'Stable Swap' },
    { value: 'concentrated', label: 'Concentrated' },
  ];

  // Available staking periods
  const stakingPeriods = [
    { value: '0', label: 'No Lock' },
    { value: '7', label: '7 Days' },
    { value: '14', label: '14 Days' },
    { value: '30', label: '30 Days' },
    { value: '90', label: '90 Days' },
    { value: '180', label: '180 Days' },
    { value: '365', label: '365 Days' },
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

  // Fetch pool information when parameters change
  useEffect(() => {
    const fetchPoolInfo = async () => {
      if (!isConnected || !api) {
        setPoolInfo(null);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // This is a simplified implementation
        // In a real app, you would query the chain for pool information
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock pool data
        const mockPoolInfo = {
          totalLiquidity: `$${(Math.random() * 10000000).toFixed(0)}`,
          apr: `${(Math.random() * 30).toFixed(2)}%`,
          volume24h: `$${(Math.random() * 1000000).toFixed(0)}`,
          userLiquidity: isConnected ? `$${(Math.random() * 10000).toFixed(2)}` : '$0',
          rewards: isConnected ? `${(Math.random() * 100).toFixed(4)} ${pairA}` : '0',
        };
        
        setPoolInfo(mockPoolInfo);
      } catch (error) {
        console.error('Failed to fetch pool info:', error);
        setPoolInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoolInfo();
  }, [pairA, pairB, poolType, isConnected, api, activeChain]);

  // Update node data when properties change
  useEffect(() => {
    data.poolType = poolType;
    data.pairA = pairA;
    data.pairB = pairB;
    data.stakingPeriod = stakingPeriod;
    data.autoCompound = autoCompound;
    data.ratio = ratio;
    data.impermanentLossProtection = impermanentLossProtection;
  }, [
    data, 
    poolType, 
    pairA, 
    pairB, 
    stakingPeriod, 
    autoCompound, 
    ratio, 
    impermanentLossProtection
  ]);

  // Handle pool type change
  const handlePoolTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPoolType(e.target.value);
    
    // Reset ratio for different pool types
    if (e.target.value === '50_50') {
      setRatio('50');
    } else if (e.target.value === '80_20') {
      setRatio('80');
    }
  };

  // Handle token A change
  const handlePairAChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPairA(e.target.value);
  };

  // Handle token B change
  const handlePairBChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPairB(e.target.value);
  };

  // Handle staking period change
  const handleStakingPeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStakingPeriod(e.target.value);
  };

  // Handle auto-compound toggle
  const handleAutoCompoundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoCompound(e.target.checked);
  };

  // Handle ratio change
  const handleRatioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRatio(e.target.value);
  };

  // Handle impermanent loss protection toggle
  const handleImpermanentLossProtectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImpermanentLossProtection(e.target.checked);
  };

  // Add liquidity to pool
  const handleAddLiquidity = async () => {
    if (!isConnected || !activeAccount || !api) {
      setActionStatus('Not connected');
      return;
    }
    
    setIsLoading(true);
    setActionStatus('Preparing transaction...');
    
    try {
      // This is a simplified implementation
      // In a real app, you would create and submit the actual transaction
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful transaction
      setActionStatus(`Added liquidity to ${pairA}/${pairB} pool`);
    } catch (error) {
      console.error('Add liquidity error:', error);
      setActionStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove liquidity from pool
  const handleRemoveLiquidity = async () => {
    if (!isConnected || !activeAccount || !api) {
      setActionStatus('Not connected');
      return;
    }
    
    if (!poolInfo || poolInfo.userLiquidity === '$0') {
      setActionStatus('No liquidity to remove');
      return;
    }
    
    setIsLoading(true);
    setActionStatus('Preparing transaction...');
    
    try {
      // This is a simplified implementation
      // In a real app, you would create and submit the actual transaction
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful transaction
      setActionStatus(`Removed liquidity from ${pairA}/${pairB} pool`);
    } catch (error) {
      console.error('Remove liquidity error:', error);
      setActionStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Harvest rewards
  const handleHarvestRewards = async () => {
    if (!isConnected || !activeAccount || !api) {
      setActionStatus('Not connected');
      return;
    }
    
    if (!poolInfo || poolInfo.rewards === '0') {
      setActionStatus('No rewards to harvest');
      return;
    }
    
    setIsLoading(true);
    setActionStatus('Preparing transaction...');
    
    try {
      // This is a simplified implementation
      // In a real app, you would create and submit the actual transaction
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful transaction
      setActionStatus(`Harvested ${poolInfo.rewards} in rewards`);
    } catch (error) {
      console.error('Harvest rewards error:', error);
      setActionStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get the secondary ratio based on the primary ratio
  const getSecondaryRatio = (): string => {
    return (100 - parseInt(ratio)).toString();
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      nodeColor="#10b981" // Green for liquidity pool nodes
      icon={<FaWater />}
      inputHandles={[{ id: 'input', position: Position.Left }]}
      outputHandles={[{ id: 'output', position: Position.Right }]}
    >
      <div className="space-y-3">
        {/* Pool type selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Pool Type</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={poolType}
            onChange={handlePoolTypeChange}
            disabled={isLoading}
          >
            {poolTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Token pair selection */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-sm font-medium block">Token A</label>
            <select
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={pairA}
              onChange={handlePairAChange}
              disabled={isLoading}
            >
              {getAvailableTokens().map((token) => (
                <option key={`a-${token}`} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium block">Token B</label>
            <select
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={pairB}
              onChange={handlePairBChange}
              disabled={isLoading}
            >
              {getAvailableTokens().map((token) => (
                <option key={`b-${token}`} value={token} disabled={token === pairA}>
                  {token}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ratio slider (for non-stable pools) */}
        {poolType !== 'stable' && (
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Ratio</label>
              <span className="text-sm">
                {ratio}% {pairA} / {getSecondaryRatio()}% {pairB}
              </span>
            </div>
            <input
              type="range"
              min={poolType === '50_50' ? '50' : '1'}
              max={poolType === '50_50' ? '50' : '99'}
              step="1"
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              value={ratio}
              onChange={handleRatioChange}
              disabled={isLoading || poolType === '50_50'}
            />
            {poolType === '50_50' && (
              <div className="text-xs text-gray-500 mt-1">
                Standard pools require 50/50 ratio
              </div>
            )}
          </div>
        )}

        {/* Staking period selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Staking Period</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={stakingPeriod}
            onChange={handleStakingPeriodChange}
            disabled={isLoading}
          >
            {stakingPeriods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>

        {/* Auto-compound toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`${id}-autocompound`}
            checked={autoCompound}
            onChange={handleAutoCompoundChange}
            className="mr-2"
            disabled={isLoading}
          />
          <label htmlFor={`${id}-autocompound`} className="text-sm font-medium">
            Auto-compound Rewards
          </label>
        </div>

        {/* Impermanent loss protection toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`${id}-ilprotection`}
            checked={impermanentLossProtection}
            onChange={handleImpermanentLossProtectionChange}
            className="mr-2"
            disabled={isLoading}
          />
          <label htmlFor={`${id}-ilprotection`} className="text-sm font-medium">
            Impermanent Loss Protection
          </label>
        </div>

        {/* Pool information */}
        {poolInfo && (
          <div className={`p-3 rounded-md ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          } space-y-2`}>
            <div className="flex justify-between items-center">
              <span className="text-xs">Total Liquidity:</span>
              <span className="text-xs font-medium">{poolInfo.totalLiquidity}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">APR:</span>
              <span className="text-xs font-medium text-green-500">{poolInfo.apr}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">24h Volume:</span>
              <span className="text-xs font-medium">{poolInfo.volume24h}</span>
            </div>
            {isConnected && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Your Liquidity:</span>
                  <span className="text-xs font-medium">{poolInfo.userLiquidity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Pending Rewards:</span>
                  <span className="text-xs font-medium">{poolInfo.rewards}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`py-2 px-4 rounded-md text-white font-medium ${
              !isConnected || isLoading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } transition-colors duration-200`}
            onClick={handleAddLiquidity}
            disabled={!isConnected || isLoading}
          >
            Add Liquidity
          </button>
          <button
            className={`py-2 px-4 rounded-md text-white font-medium ${
              !isConnected || isLoading || !poolInfo || poolInfo.userLiquidity === '$0'
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            } transition-colors duration-200`}
            onClick={handleRemoveLiquidity}
            disabled={!isConnected || isLoading || !poolInfo || poolInfo.userLiquidity === '$0'}
          >
            Remove Liquidity
          </button>
        </div>

        {/* Harvest rewards button */}
        {isConnected && poolInfo && poolInfo.rewards !== '0' && (
          <button
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              isLoading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-yellow-600 hover:bg-yellow-700'
            } transition-colors duration-200`}
            onClick={handleHarvestRewards}
            disabled={isLoading}
          >
            Harvest Rewards
          </button>
        )}

        {/* Action status */}
        {actionStatus && (
          <div className={`text-xs ${
            actionStatus.startsWith('Added') || actionStatus.startsWith('Removed') || actionStatus.startsWith('Harvested')
              ? 'text-green-500'
              : actionStatus.startsWith('Error') || actionStatus.startsWith('Not') || actionStatus.startsWith('No')
              ? 'text-red-500'
              : isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {actionStatus}
          </div>
        )}

        {/* Not connected warning */}
        {!isConnected && (
          <div className="text-xs text-amber-500">
            Connect a wallet to manage liquidity
          </div>
        )}
      </div>
    </BaseNode>
  );
};

export default memo(LiquidityPoolNode);
