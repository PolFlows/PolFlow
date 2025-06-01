import React, { useState, useEffect, memo } from 'react';
import { NodeProps, Position } from 'reactflow';
import { FaExchangeAlt } from 'react-icons/fa';
import BaseNode, { BaseNodeData } from './BaseNode';
import { usePolkadot, ChainType } from '@/contexts/PolkadotContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useWallet } from '@/contexts/WalletContext';

// XCM transfer node specific data
interface XCMTransferNodeData extends BaseNodeData {
  sourceChain: string;
  destinationChain: string;
  xcmVersion: string;
  feeCalculation: string;
  hrmpStatus: string;
}

// XCM transfer node component
const XCMTransferNode: React.FC<NodeProps<XCMTransferNodeData>> = ({ id, data, selected }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { 
    activeChain, 
    setActiveChain, 
    getXcmDestinations, 
    formatXcmDestination,
    estimateFee,
    submitTransaction,
    api
  } = usePolkadot();
  const { activeAccount, isConnected } = useWallet();
  
  const [sourceChain, setSourceChain] = useState<string>(data.sourceChain || 'Polkadot');
  const [destinationChain, setDestinationChain] = useState<string>(data.destinationChain || 'Asset Hub');
  const [xcmVersion, setXcmVersion] = useState<string>(data.xcmVersion || 'v3');
  const [feeCalculation, setFeeCalculation] = useState<string>(data.feeCalculation || 'auto');
  const [feeEstimate, setFeeEstimate] = useState<string>('0');
  const [transferStatus, setTransferStatus] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [hrmpStatus, setHrmpStatus] = useState<string>(data.hrmpStatus || 'unknown');

  // XCM versions available
  const xcmVersions = ['v2', 'v3'];
  
  // Fee calculation methods
  const feeCalculationMethods = ['auto', 'manual'];

  // Update available destinations when source chain changes
  useEffect(() => {
    const updateDestinations = async () => {
      try {
        // Convert source chain name to chain type
        const sourceChainType = sourceChain.toLowerCase().replace(' ', '-') as ChainType;
        
        // Set the active chain to the source chain to get destinations
        await setActiveChain(sourceChainType);
        
        // Get available XCM destinations for the source chain
        const availableDestinations = getXcmDestinations().map(chain => {
          // Convert chain type back to display name
          return chain.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        });
        
        setDestinations(availableDestinations);
        
        // If current destination is not available, select the first one
        if (availableDestinations.length > 0 && !availableDestinations.includes(destinationChain)) {
          setDestinationChain(availableDestinations[0]);
          data.destinationChain = availableDestinations[0];
        }
        
        // Check HRMP channel status between the chains
        checkHrmpStatus(sourceChainType, destinationChain.toLowerCase().replace(' ', '-') as ChainType);
      } catch (error) {
        console.error('Failed to update destinations:', error);
        setDestinations([]);
      }
    };

    if (isConnected) {
      updateDestinations();
    }
  }, [sourceChain, isConnected, setActiveChain, getXcmDestinations]);

  // Estimate transfer fee when parameters change
  useEffect(() => {
    const estimateTransferFee = async () => {
      if (!isConnected || !activeAccount || !api) return;
      
      try {
        // This is a simplified implementation
        // In a real app, you would create the actual XCM transfer transaction
        // and estimate its fee
        
        // Convert chain names to chain types
        const sourceChainType = sourceChain.toLowerCase().replace(' ', '-') as ChainType;
        const destChainType = destinationChain.toLowerCase().replace(' ', '-') as ChainType;
        
        // Mock transaction for fee estimation
        const mockXcmTx = api.tx.xcmPallet?.limitedReserveTransferAssets || api.tx.polkadotXcm?.limitedReserveTransferAssets;
        
        if (!mockXcmTx) {
          setFeeEstimate('XCM not supported');
          return;
        }
        
        // Create a mock destination and beneficiary for fee estimation
        const destination = {
          V3: {
            parents: 1,
            interior: {
              X1: {
                Parachain: formatXcmDestination(destChainType).includes('Parachain') 
                  ? parseInt(formatXcmDestination(destChainType).split(' ')[1])
                  : 1000
              }
            }
          }
        };
        
        const beneficiary = {
          V3: {
            parents: 0,
            interior: {
              X1: {
                AccountId32: {
                  network: 'Any',
                  id: activeAccount.address
                }
              }
            }
          }
        };
        
        // Mock assets to transfer
        const assets = {
          V3: [{
            id: {
              Concrete: {
                parents: 0,
                interior: 'Here'
              }
            },
            fun: {
              Fungible: 1000000000 // 1 DOT in planck
            }
          }]
        };
        
        // Create the mock transaction
        const tx = mockXcmTx(
          destination,
          beneficiary,
          assets,
          0, // fee index
          'Unlimited' // weight limit
        );
        
        // Estimate fee
        const { success, fee, error } = await estimateFee(tx, sourceChainType);
        
        if (success && fee) {
          setFeeEstimate(fee);
        } else {
          setFeeEstimate(error || 'Failed to estimate');
        }
      } catch (error) {
        console.error('Fee estimation error:', error);
        setFeeEstimate('Error');
      }
    };

    if (feeCalculation === 'auto') {
      estimateTransferFee();
    }
  }, [sourceChain, destinationChain, xcmVersion, feeCalculation, isConnected, activeAccount, api, estimateFee, formatXcmDestination]);

  // Check HRMP channel status between chains
  const checkHrmpStatus = async (source: ChainType, destination: ChainType) => {
    try {
      // This is a simplified implementation
      // In a real app, you would query the relay chain for HRMP channel status
      
      // For demo purposes, we'll simulate different statuses
      const hrmpStatuses: Record<string, string> = {
        'polkadot-asset-hub': 'active',
        'polkadot-acala': 'active',
        'polkadot-moonbeam': 'active',
        'polkadot-astar': 'active',
        'asset-hub-acala': 'active',
        'asset-hub-moonbeam': 'active',
        'acala-moonbeam': 'pending',
        'astar-moonbeam': 'inactive',
        'default': 'unknown'
      };
      
      const key = `${source}-${destination}`;
      const reverseKey = `${destination}-${source}`;
      
      const status = hrmpStatuses[key] || hrmpStatuses[reverseKey] || hrmpStatuses.default;
      
      setHrmpStatus(status);
      data.hrmpStatus = status;
    } catch (error) {
      console.error('Failed to check HRMP status:', error);
      setHrmpStatus('unknown');
      data.hrmpStatus = 'unknown';
    }
  };

  // Handle source chain selection change
  const handleSourceChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSourceChain = e.target.value;
    setSourceChain(newSourceChain);
    data.sourceChain = newSourceChain;
  };

  // Handle destination chain selection change
  const handleDestinationChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDestinationChain = e.target.value;
    setDestinationChain(newDestinationChain);
    data.destinationChain = newDestinationChain;
    
    // Update HRMP status
    const sourceChainType = sourceChain.toLowerCase().replace(' ', '-') as ChainType;
    const destChainType = newDestinationChain.toLowerCase().replace(' ', '-') as ChainType;
    checkHrmpStatus(sourceChainType, destChainType);
  };

  // Handle XCM version selection change
  const handleXcmVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setXcmVersion(e.target.value);
    data.xcmVersion = e.target.value;
  };

  // Handle fee calculation method change
  const handleFeeCalculationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFeeCalculation(e.target.value);
    data.feeCalculation = e.target.value;
  };

  // Execute XCM transfer
  const handleTransfer = async () => {
    if (!isConnected || !activeAccount || !api) {
      setTransferStatus('Not connected');
      return;
    }
    
    if (hrmpStatus !== 'active') {
      setTransferStatus('HRMP channel not active');
      return;
    }
    
    setIsTransferring(true);
    setTransferStatus('Preparing...');
    
    try {
      // This is a simplified implementation
      // In a real app, you would create and submit the actual XCM transfer transaction
      
      // Convert chain names to chain types
      const sourceChainType = sourceChain.toLowerCase().replace(' ', '-') as ChainType;
      const destChainType = destinationChain.toLowerCase().replace(' ', '-') as ChainType;
      
      // Set active chain to source chain
      await setActiveChain(sourceChainType);
      
      // Get the XCM transfer function
      const xcmTransferTx = api.tx.xcmPallet?.limitedReserveTransferAssets || api.tx.polkadotXcm?.limitedReserveTransferAssets;
      
      if (!xcmTransferTx) {
        throw new Error('XCM transfer not supported on this chain');
      }
      
      // Create destination and beneficiary
      const destination = {
        V3: {
          parents: 1,
          interior: {
            X1: {
              Parachain: formatXcmDestination(destChainType).includes('Parachain') 
                ? parseInt(formatXcmDestination(destChainType).split(' ')[1])
                : 1000
            }
          }
        }
      };
      
      const beneficiary = {
        V3: {
          parents: 0,
          interior: {
            X1: {
              AccountId32: {
                network: 'Any',
                id: activeAccount.address
              }
            }
          }
        }
      };
      
      // Mock assets to transfer (1 DOT in planck)
      const assets = {
        V3: [{
          id: {
            Concrete: {
              parents: 0,
              interior: 'Here'
            }
          },
          fun: {
            Fungible: 1000000000
          }
        }]
      };
      
      // Create the transaction
      const tx = xcmTransferTx(
        destination,
        beneficiary,
        assets,
        0, // fee index
        'Unlimited' // weight limit
      );
      
      setTransferStatus('Submitting...');
      
      // Submit the transaction
      const result = await submitTransaction(tx, activeAccount, sourceChainType);
      
      if (result.success) {
        setTransferStatus(`Success: ${result.hash?.substring(0, 10)}...`);
      } else {
        setTransferStatus(`Failed: ${result.error}`);
      }
    } catch (error) {
      console.error('XCM transfer error:', error);
      setTransferStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTransferring(false);
    }
  };

  // Get HRMP status color
  const getHrmpStatusColor = () => {
    switch (hrmpStatus) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      nodeColor="#8b5cf6" // Purple for XCM nodes
      icon={<FaExchangeAlt />}
      inputHandles={[{ id: 'input', position: Position.Left }]}
      outputHandles={[{ id: 'output', position: Position.Right }]}
    >
      <div className="space-y-3">
        {/* Source chain selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Source Chain</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={sourceChain}
            onChange={handleSourceChainChange}
            disabled={isTransferring}
          >
            {['Polkadot', 'Asset Hub', 'Acala', 'Moonbeam', 'Astar'].map((chain) => (
              <option key={chain} value={chain}>
                {chain}
              </option>
            ))}
          </select>
        </div>

        {/* Destination chain selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Destination Chain</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={destinationChain}
            onChange={handleDestinationChainChange}
            disabled={isTransferring || destinations.length === 0}
          >
            {destinations.length > 0 ? (
              destinations.map((chain) => (
                <option key={chain} value={chain}>
                  {chain}
                </option>
              ))
            ) : (
              <option value="">No destinations available</option>
            )}
          </select>
        </div>

        {/* HRMP channel status */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getHrmpStatusColor()}`}></div>
          <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            HRMP Channel: {hrmpStatus.charAt(0).toUpperCase() + hrmpStatus.slice(1)}
          </span>
        </div>

        {/* XCM version selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">XCM Version</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={xcmVersion}
            onChange={handleXcmVersionChange}
            disabled={isTransferring}
          >
            {xcmVersions.map((version) => (
              <option key={version} value={version}>
                {version}
              </option>
            ))}
          </select>
        </div>

        {/* Fee calculation method */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Fee Calculation</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={feeCalculation}
            onChange={handleFeeCalculationChange}
            disabled={isTransferring}
          >
            {feeCalculationMethods.map((method) => (
              <option key={method} value={method}>
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Fee estimate */}
        {feeCalculation === 'auto' && (
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Estimated fee: {feeEstimate}
          </div>
        )}

        {/* Transfer button */}
        <button
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            !isConnected || hrmpStatus !== 'active' || isTransferring
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          } transition-colors duration-200`}
          onClick={handleTransfer}
          disabled={!isConnected || hrmpStatus !== 'active' || isTransferring}
        >
          {isTransferring ? 'Processing...' : 'Execute XCM Transfer'}
        </button>

        {/* Transfer status */}
        {transferStatus && (
          <div className={`text-xs ${
            transferStatus.startsWith('Success')
              ? 'text-green-500'
              : transferStatus.startsWith('Failed') || transferStatus.startsWith('Error')
              ? 'text-red-500'
              : isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {transferStatus}
          </div>
        )}

        {/* Not connected warning */}
        {!isConnected && (
          <div className="text-xs text-amber-500">
            Connect a wallet to perform XCM transfers
          </div>
        )}
      </div>
    </BaseNode>
  );
};

export default memo(XCMTransferNode);
