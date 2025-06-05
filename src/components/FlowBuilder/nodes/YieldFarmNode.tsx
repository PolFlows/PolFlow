import React, { useState, useEffect, memo } from 'react';
import { NodeProps, Position } from 'reactflow';
import { FaSeedling } from 'react-icons/fa';
import BaseNode, { BaseNodeData } from './BaseNode';
import { usePolkadot } from '@/contexts/PolkadotContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useWallet } from '@/contexts/WalletContext';

// Yield farm node specific data
interface YieldFarmNodeData extends BaseNodeData {
  platforms: string[];
  selectedPlatform: string;
  riskLevel: string;
  minAPY: string;
  compoundFrequency: string;
  autoHarvest?: boolean;
  maxGasFee?: string;
  assetFilter?: string[];
}

// Farm opportunity interface
interface FarmOpportunity {
  platform: string;
  name: string;
  assets: string[];
  apy: string;
  tvl: string;
  risk: string;
  rewards: string[];
  lockPeriod?: string;
}

// Yield farm node component
const YieldFarmNode: React.FC<NodeProps<YieldFarmNodeData>> = ({ id, data, selected }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { api, activeChain } = usePolkadot();
  const { activeAccount, isConnected } = useWallet();
  
  // State for the node's properties
  const [selectedPlatform, setSelectedPlatform] = useState<string>(data.selectedPlatform || 'Bifrost');
  const [riskLevel, setRiskLevel] = useState<string>(data.riskLevel || 'medium');
  const [minAPY, setMinAPY] = useState<string>(data.minAPY || '5');
  const [compoundFrequency, setCompoundFrequency] = useState<string>(data.compoundFrequency || 'daily');
  const [autoHarvest, setAutoHarvest] = useState<boolean>(data.autoHarvest || true);
  const [maxGasFee, setMaxGasFee] = useState<string>(data.maxGasFee || '5');
  const [assetFilter, setAssetFilter] = useState<string[]>(data.assetFilter || []);
  
  const [farmOpportunities, setFarmOpportunities] = useState<FarmOpportunity[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<FarmOpportunity | null>(null);
  const [userPositions, setUserPositions] = useState<{
    staked: string;
    earned: string;
    stakedValue: string;
    apr: string;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionStatus, setActionStatus] = useState<string>('');

  // Risk levels
  const riskLevels = [
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' },
  ];

  // Compound frequencies
  const compoundFrequencies = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  // Get supported platforms based on the active chain
  const getSupportedPlatforms = (): string[] => {
    // This is a simplified implementation
    // In a real app, you would query for available platforms on each chain
    const platformMap: Record<string, string[]> = {
      'polkadot': ['Bifrost', 'Parallel', 'Acala'],
      'kusama': ['Karura', 'Bifrost', 'Mangata'],
      'asset-hub': ['Bifrost', 'Parallel'],
      'acala': ['Acala Farms', 'Acala Liquid Staking', 'Tapio'],
      'moonbeam': ['StellaSwap', 'BeamSwap', 'Zenlink'],
      'astar': ['ArthSwap', 'Sirius Finance', 'Kagla'],
      'hydradx': ['Basilisk', 'HydraDX Omnipool'],
      'bifrost': ['Bifrost vDOT', 'Bifrost vKSM', 'Bifrost LSD'],
      'parallel': ['Parallel Liquid Staking', 'Parallel AMM'],
    };
    
    return platformMap[activeChain] || ['Bifrost', 'Parallel', 'Acala'];
  };

  // Fetch farm opportunities when parameters change
  useEffect(() => {
    const fetchFarmOpportunities = async () => {
      if (!api) {
        setFarmOpportunities([]);
        setSelectedFarm(null);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // This is a simplified implementation
        // In a real app, you would query the chain or platform APIs for farm opportunities
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock farm opportunities based on selected platform and risk level
        const mockOpportunities: FarmOpportunity[] = [];
        
        // Different opportunities based on platform
        if (selectedPlatform === 'Bifrost') {
          mockOpportunities.push(
            {
              platform: 'Bifrost',
              name: 'vDOT Staking',
              assets: ['DOT'],
              apy: `${(Math.random() * 5 + 6).toFixed(2)}%`,
              tvl: `$${(Math.random() * 10000000 + 5000000).toFixed(0)}`,
              risk: 'low',
              rewards: ['BNC'],
              lockPeriod: 'None',
            },
            {
              platform: 'Bifrost',
              name: 'vDOT/DOT LP',
              assets: ['vDOT', 'DOT'],
              apy: `${(Math.random() * 10 + 15).toFixed(2)}%`,
              tvl: `$${(Math.random() * 5000000 + 1000000).toFixed(0)}`,
              risk: 'medium',
              rewards: ['BNC', 'vDOT'],
            },
            {
              platform: 'Bifrost',
              name: 'BNC/KSM LP',
              assets: ['BNC', 'KSM'],
              apy: `${(Math.random() * 20 + 25).toFixed(2)}%`,
              tvl: `$${(Math.random() * 2000000 + 500000).toFixed(0)}`,
              risk: 'high',
              rewards: ['BNC'],
            }
          );
        } else if (selectedPlatform === 'Parallel') {
          mockOpportunities.push(
            {
              platform: 'Parallel',
              name: 'PARA Staking',
              assets: ['PARA'],
              apy: `${(Math.random() * 8 + 10).toFixed(2)}%`,
              tvl: `$${(Math.random() * 8000000 + 2000000).toFixed(0)}`,
              risk: 'low',
              rewards: ['PARA'],
              lockPeriod: '7 days',
            },
            {
              platform: 'Parallel',
              name: 'PARA/DOT LP',
              assets: ['PARA', 'DOT'],
              apy: `${(Math.random() * 15 + 20).toFixed(2)}%`,
              tvl: `$${(Math.random() * 3000000 + 1000000).toFixed(0)}`,
              risk: 'medium',
              rewards: ['PARA', 'cDOT'],
            },
            {
              platform: 'Parallel',
              name: 'USDT/USDC LP',
              assets: ['USDT', 'USDC'],
              apy: `${(Math.random() * 5 + 8).toFixed(2)}%`,
              tvl: `$${(Math.random() * 10000000 + 5000000).toFixed(0)}`,
              risk: 'low',
              rewards: ['PARA'],
            }
          );
        } else if (selectedPlatform === 'Acala') {
          mockOpportunities.push(
            {
              platform: 'Acala',
              name: 'LDOT Staking',
              assets: ['LDOT'],
              apy: `${(Math.random() * 6 + 7).toFixed(2)}%`,
              tvl: `$${(Math.random() * 15000000 + 10000000).toFixed(0)}`,
              risk: 'low',
              rewards: ['ACA'],
              lockPeriod: 'None',
            },
            {
              platform: 'Acala',
              name: 'ACA/aUSD LP',
              assets: ['ACA', 'aUSD'],
              apy: `${(Math.random() * 12 + 18).toFixed(2)}%`,
              tvl: `$${(Math.random() * 5000000 + 2000000).toFixed(0)}`,
              risk: 'medium',
              rewards: ['ACA', 'aUSD'],
            },
            {
              platform: 'Acala',
              name: 'DOT/LDOT LP',
              assets: ['DOT', 'LDOT'],
              apy: `${(Math.random() * 10 + 12).toFixed(2)}%`,
              tvl: `$${(Math.random() * 8000000 + 3000000).toFixed(0)}`,
              risk: 'low',
              rewards: ['ACA', 'LDOT'],
            }
          );
        } else {
          // Generic opportunities for other platforms
          mockOpportunities.push(
            {
              platform: selectedPlatform,
              name: 'Staking Pool',
              assets: ['DOT'],
              apy: `${(Math.random() * 10 + 5).toFixed(2)}%`,
              tvl: `$${(Math.random() * 5000000 + 1000000).toFixed(0)}`,
              risk: 'low',
              rewards: ['Platform Token'],
              lockPeriod: 'None',
            },
            {
              platform: selectedPlatform,
              name: 'Liquidity Mining',
              assets: ['DOT', 'USDC'],
              apy: `${(Math.random() * 20 + 10).toFixed(2)}%`,
              tvl: `$${(Math.random() * 3000000 + 500000).toFixed(0)}`,
              risk: 'medium',
              rewards: ['Platform Token', 'DOT'],
            }
          );
        }
        
        // Filter opportunities based on risk level and min APY
        const filteredOpportunities = mockOpportunities.filter(opp => {
          const oppRiskLevel = opp.risk;
          const oppAPY = parseFloat(opp.apy.replace('%', ''));
          
          // Match risk level
          if (riskLevel === 'low' && oppRiskLevel !== 'low') return false;
          if (riskLevel === 'medium' && oppRiskLevel === 'high') return false;
          
          // Match minimum APY
          if (oppAPY < parseFloat(minAPY)) return false;
          
          // Match asset filter if specified
          if (assetFilter.length > 0) {
            const hasMatchingAsset = opp.assets.some(asset => assetFilter.includes(asset));
            if (!hasMatchingAsset) return false;
          }
          
          return true;
        });
        
        setFarmOpportunities(filteredOpportunities);
        
        // Select the highest APY opportunity by default
        if (filteredOpportunities.length > 0) {
          const sortedByAPY = [...filteredOpportunities].sort((a, b) => {
            const aAPY = parseFloat(a.apy.replace('%', ''));
            const bAPY = parseFloat(b.apy.replace('%', ''));
            return bAPY - aAPY;
          });
          
          setSelectedFarm(sortedByAPY[0]);
        } else {
          setSelectedFarm(null);
        }
        
        // If user is connected, generate mock user positions
        if (isConnected && filteredOpportunities.length > 0) {
          const selectedOpp = filteredOpportunities[0];
          setUserPositions({
            staked: `${(Math.random() * 10).toFixed(2)} ${selectedOpp.assets[0]}`,
            earned: `${(Math.random() * 1).toFixed(4)} ${selectedOpp.rewards[0]}`,
            stakedValue: `$${(Math.random() * 1000).toFixed(2)}`,
            apr: selectedOpp.apy,
          });
        } else {
          setUserPositions(null);
        }
      } catch (error) {
        console.error('Failed to fetch farm opportunities:', error);
        setFarmOpportunities([]);
        setSelectedFarm(null);
        setUserPositions(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmOpportunities();
  }, [
    selectedPlatform, 
    riskLevel, 
    minAPY, 
    assetFilter, 
    isConnected, 
    api, 
    activeChain
  ]);

  // Update node data when properties change
  useEffect(() => {
    data.selectedPlatform = selectedPlatform;
    data.riskLevel = riskLevel;
    data.minAPY = minAPY;
    data.compoundFrequency = compoundFrequency;
    data.autoHarvest = autoHarvest;
    data.maxGasFee = maxGasFee;
    data.assetFilter = assetFilter;
  }, [
    data, 
    selectedPlatform, 
    riskLevel, 
    minAPY, 
    compoundFrequency, 
    autoHarvest, 
    maxGasFee, 
    assetFilter
  ]);

  // Handle platform change
  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlatform(e.target.value);
  };

  // Handle risk level change
  const handleRiskLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRiskLevel(e.target.value);
  };

  // Handle min APY change
  const handleMinAPYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimals
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setMinAPY(value);
  };

  // Handle compound frequency change
  const handleCompoundFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCompoundFrequency(e.target.value);
  };

  // Handle auto harvest toggle
  const handleAutoHarvestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoHarvest(e.target.checked);
  };

  // Handle max gas fee change
  const handleMaxGasFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimals
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setMaxGasFee(value);
  };

  // Handle farm selection
  const handleFarmSelect = (farm: FarmOpportunity) => {
    setSelectedFarm(farm);
    
    // Simulate fetching user position for the selected farm
    if (isConnected) {
      setUserPositions({
        staked: `${(Math.random() * 10).toFixed(2)} ${farm.assets[0]}`,
        earned: `${(Math.random() * 1).toFixed(4)} ${farm.rewards[0]}`,
        stakedValue: `$${(Math.random() * 1000).toFixed(2)}`,
        apr: farm.apy,
      });
    }
  };

  // Stake in farm
  const handleStake = async () => {
    if (!isConnected || !activeAccount || !api || !selectedFarm) {
      setActionStatus('Not connected or no farm selected');
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
      setActionStatus(`Staked in ${selectedFarm.name} farm`);
      
      // Update user positions with mock data
      setUserPositions({
        staked: `${(Math.random() * 10 + 5).toFixed(2)} ${selectedFarm.assets[0]}`,
        earned: '0.0000',
        stakedValue: `$${(Math.random() * 1000 + 500).toFixed(2)}`,
        apr: selectedFarm.apy,
      });
    } catch (error) {
      console.error('Stake error:', error);
      setActionStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Unstake from farm
  const handleUnstake = async () => {
    if (!isConnected || !activeAccount || !api || !selectedFarm) {
      setActionStatus('Not connected or no farm selected');
      return;
    }
    
    if (!userPositions || parseFloat(userPositions.staked) === 0) {
      setActionStatus('No staked assets to unstake');
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
      setActionStatus(`Unstaked from ${selectedFarm.name} farm`);
      
      // Update user positions with mock data
      setUserPositions(null);
    } catch (error) {
      console.error('Unstake error:', error);
      setActionStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Harvest rewards
  const handleHarvest = async () => {
    if (!isConnected || !activeAccount || !api || !selectedFarm) {
      setActionStatus('Not connected or no farm selected');
      return;
    }
    
    if (!userPositions || parseFloat(userPositions.earned) === 0) {
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
      setActionStatus(`Harvested ${userPositions.earned} in rewards`);
      
      // Update user positions with mock data
      if (userPositions) {
        setUserPositions({
          ...userPositions,
          earned: '0.0000',
        });
      }
    } catch (error) {
      console.error('Harvest error:', error);
      setActionStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle auto-compound
  const handleToggleAutoCompound = async () => {
    if (!isConnected || !activeAccount || !api || !selectedFarm) {
      setActionStatus('Not connected or no farm selected');
      return;
    }
    
    setIsLoading(true);
    setActionStatus(`${autoHarvest ? 'Disabling' : 'Enabling'} auto-compound...`);
    
    try {
      // This is a simplified implementation
      // In a real app, you would create and submit the actual transaction
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Toggle auto-compound
      setAutoHarvest(!autoHarvest);
      
      // Simulate successful transaction
      setActionStatus(`Auto-compound ${autoHarvest ? 'disabled' : 'enabled'}`);
    } catch (error) {
      console.error('Auto-compound toggle error:', error);
      setActionStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      nodeColor="#eab308" // Yellow for yield farm nodes
      icon={<FaSeedling />}
      inputHandles={[{ id: 'input', position: Position.Left }]}
      outputHandles={[{ id: 'output', position: Position.Right }]}
    >
      <div className="space-y-3">
        {/* Platform selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Farming Platform</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={selectedPlatform}
            onChange={handlePlatformChange}
            disabled={isLoading}
          >
            {getSupportedPlatforms().map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>

        {/* Risk level selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Risk Level</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={riskLevel}
            onChange={handleRiskLevelChange}
            disabled={isLoading}
          >
            {riskLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Min APY input */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <label className="text-sm font-medium">Minimum APY (%)</label>
            <span className="text-sm">{minAPY}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            value={minAPY}
            onChange={(e) => setMinAPY(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%+</span>
          </div>
        </div>

        {/* Compound frequency selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Compound Frequency</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={compoundFrequency}
            onChange={handleCompoundFrequencyChange}
            disabled={isLoading}
          >
            {compoundFrequencies.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
        </div>

        {/* Auto-harvest toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`${id}-autoharvest`}
            checked={autoHarvest}
            onChange={handleAutoHarvestChange}
            className="mr-2"
            disabled={isLoading}
          />
          <label htmlFor={`${id}-autoharvest`} className="text-sm font-medium">
            Auto-harvest Rewards
          </label>
        </div>

        {/* Max gas fee input */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Max Gas Fee (%)</label>
          <div className="relative">
            <input
              type="text"
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={maxGasFee}
              onChange={handleMaxGasFeeChange}
              placeholder="5"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm font-medium">
              %
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Maximum % of rewards to spend on gas
          </div>
        </div>

        {/* Farm opportunities */}
        {farmOpportunities.length > 0 ? (
          <div className="space-y-1">
            <label className="text-sm font-medium block">Available Farms</label>
            <div className={`max-h-32 overflow-y-auto p-1 rounded ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              {farmOpportunities.map((farm, index) => (
                <div
                  key={`${farm.platform}-${farm.name}-${index}`}
                  className={`p-2 rounded mb-1 cursor-pointer ${
                    selectedFarm === farm
                      ? isDark ? 'bg-yellow-900' : 'bg-yellow-100'
                      : isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => handleFarmSelect(farm)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{farm.name}</span>
                    <span className="text-green-500 text-sm">{farm.apy}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>{farm.assets.join('/')}</span>
                    <span>TVL: {farm.tvl}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-2">
            <span className="text-sm">Loading farms...</span>
          </div>
        ) : (
          <div className="text-center py-2">
            <span className="text-sm">No farms match your criteria</span>
          </div>
        )}

        {/* User positions */}
        {isConnected && userPositions && (
          <div className={`p-3 rounded-md ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          } space-y-2`}>
            <div className="flex justify-between items-center">
              <span className="text-xs">Staked:</span>
              <span className="text-xs font-medium">{userPositions.staked}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Value:</span>
              <span className="text-xs font-medium">{userPositions.stakedValue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">APR:</span>
              <span className="text-xs font-medium text-green-500">{userPositions.apr}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Earned:</span>
              <span className="text-xs font-medium text-yellow-500">{userPositions.earned}</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {selectedFarm && (
          <div className="grid grid-cols-2 gap-2">
            {(!userPositions || parseFloat(userPositions.staked) === 0) ? (
              <button
                className={`py-2 px-4 rounded-md text-white font-medium ${
                  !isConnected || isLoading
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                } transition-colors duration-200`}
                onClick={handleStake}
                disabled={!isConnected || isLoading}
              >
                Stake
              </button>
            ) : (
              <button
                className={`py-2 px-4 rounded-md text-white font-medium ${
                  !isConnected || isLoading
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                } transition-colors duration-200`}
                onClick={handleUnstake}
                disabled={!isConnected || isLoading}
              >
                Unstake
              </button>
            )}
            
            <button
              className={`py-2 px-4 rounded-md text-white font-medium ${
                !isConnected || isLoading || !userPositions || parseFloat(userPositions.earned) === 0
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } transition-colors duration-200`}
              onClick={handleHarvest}
              disabled={!isConnected || isLoading || !userPositions || parseFloat(userPositions.earned) === 0}
            >
              Harvest
            </button>
          </div>
        )}

        {/* Auto-compound toggle button */}
        {userPositions && parseFloat(userPositions.staked) > 0 && (
          <button
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              !isConnected || isLoading
                ? 'bg-gray-500 cursor-not-allowed'
                : autoHarvest
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors duration-200`}
            onClick={handleToggleAutoCompound}
            disabled={!isConnected || isLoading}
          >
            {autoHarvest ? 'Disable Auto-compound' : 'Enable Auto-compound'}
          </button>
        )}

        {/* Action status */}
        {actionStatus && (
          <div className={`text-xs ${
            actionStatus.startsWith('Staked') || actionStatus.startsWith('Unstaked') || actionStatus.startsWith('Harvested') || actionStatus.startsWith('Auto-compound')
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
            Connect a wallet to manage farms
          </div>
        )}
      </div>
    </BaseNode>
  );
};

export default memo(YieldFarmNode);
