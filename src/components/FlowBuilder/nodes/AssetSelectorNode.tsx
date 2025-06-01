import React, { useState, useEffect, memo } from 'react';
import { NodeProps, Position } from 'reactflow';
import { FaCoins } from 'react-icons/fa';
import BaseNode, { BaseNodeData } from './BaseNode';
import { usePolkadot } from '@/contexts/PolkadotContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useWallet } from '@/contexts/WalletContext';

// Asset selector node specific data
interface AssetSelectorNodeData extends BaseNodeData {
  chains: string[];
  assets: string[];
  selectedChain: string;
  selectedAsset: string;
  amount: string;
}

// Asset selector node component
const AssetSelectorNode: React.FC<NodeProps<AssetSelectorNodeData>> = ({ id, data, selected }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { activeChain, setActiveChain, getBalance } = usePolkadot();
  const { activeAccount, isConnected } = useWallet();
  
  const [selectedChain, setSelectedChain] = useState<string>(data.selectedChain || 'Polkadot');
  const [selectedAsset, setSelectedAsset] = useState<string>(data.selectedAsset || 'DOT');
  const [amount, setAmount] = useState<string>(data.amount || '0');
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(false);

  // Filter assets based on selected chain
  const getChainAssets = (chain: string): string[] => {
    // This is a simplified implementation
    // In a real app, you would query the chain for available assets
    const assetMap: Record<string, string[]> = {
      'Polkadot': ['DOT'],
      'Kusama': ['KSM'],
      'Asset Hub': ['DOT', 'USDT', 'USDC'],
      'Acala': ['ACA', 'LDOT', 'aUSD', 'DOT'],
      'Moonbeam': ['GLMR', 'xcDOT', 'xcUSDT'],
      'Astar': ['ASTR', 'DOT', 'USDC'],
    };
    
    return assetMap[chain] || data.assets;
  };

  // Update available assets when chain changes
  useEffect(() => {
    const assets = getChainAssets(selectedChain);
    // If current selected asset is not available in the new chain, select the first one
    if (!assets.includes(selectedAsset) && assets.length > 0) {
      setSelectedAsset(assets[0]);
      data.selectedAsset = assets[0];
    }
  }, [selectedChain, data, selectedAsset]);

  // Fetch balance when account or chain/asset changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (isConnected && activeAccount) {
        setLoading(true);
        try {
          // Convert chain name to chain type (simplified)
          const chainType = selectedChain.toLowerCase().replace(' ', '-') as any;
          const balanceStr = await getBalance(activeAccount.address, chainType);
          setBalance(balanceStr);
        } catch (error) {
          console.error('Failed to fetch balance:', error);
          setBalance('Error');
        } finally {
          setLoading(false);
        }
      } else {
        setBalance('0');
      }
    };

    fetchBalance();
  }, [isConnected, activeAccount, selectedChain, selectedAsset, getBalance]);

  // Handle chain selection change
  const handleChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newChain = e.target.value;
    setSelectedChain(newChain);
    data.selectedChain = newChain;
    
    // Update active chain in the Polkadot context
    if (setActiveChain) {
      // Convert chain name to chain type (simplified)
      const chainType = newChain.toLowerCase().replace(' ', '-') as any;
      setActiveChain(chainType);
    }
  };

  // Handle asset selection change
  const handleAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAsset(e.target.value);
    data.selectedAsset = e.target.value;
  };

  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimals
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
    data.amount = value;
  };

  // Set max amount (100% of balance)
  const handleSetMax = () => {
    if (balance && balance !== 'Error' && balance !== '0') {
      // Extract the numeric part of the balance (simplified)
      const numericBalance = balance.split(' ')[0];
      setAmount(numericBalance);
      data.amount = numericBalance;
    }
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      nodeColor="#10b981" // Green for asset nodes
      icon={<FaCoins />}
      inputHandles={[{ id: 'input', position: Position.Left }]}
      outputHandles={[{ id: 'output', position: Position.Right }]}
    >
      <div className="space-y-3">
        {/* Chain selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Blockchain</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={selectedChain}
            onChange={handleChainChange}
          >
            {data.chains.map((chain) => (
              <option key={chain} value={chain}>
                {chain}
              </option>
            ))}
          </select>
        </div>

        {/* Asset selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Asset</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={selectedAsset}
            onChange={handleAssetChange}
          >
            {getChainAssets(selectedChain).map((asset) => (
              <option key={asset} value={asset}>
                {asset}
              </option>
            ))}
          </select>
        </div>

        {/* Amount input */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Amount</label>
            {isConnected && (
              <button
                onClick={handleSetMax}
                className="text-xs text-blue-500 hover:text-blue-600"
                disabled={loading || balance === 'Error' || balance === '0'}
              >
                Max
              </button>
            )}
          </div>
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
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm font-medium">
              {selectedAsset}
            </div>
          </div>
        </div>

        {/* Balance display */}
        {isConnected && (
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {loading ? (
              <span>Loading balance...</span>
            ) : (
              <span>Balance: {balance}</span>
            )}
          </div>
        )}

        {/* Not connected warning */}
        {!isConnected && (
          <div className="text-xs text-amber-500">
            Connect a wallet to view balances
          </div>
        )}
      </div>
    </BaseNode>
  );
};

export default memo(AssetSelectorNode);
