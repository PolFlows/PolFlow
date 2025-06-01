import React, { useState, useEffect, memo } from 'react';
import { NodeProps, Position } from 'reactflow';
import { FaWallet } from 'react-icons/fa';
import BaseNode, { BaseNodeData } from './BaseNode';
import { useWallet, WalletType } from '@/contexts/WalletContext';
import { useTheme } from '@/contexts/ThemeContext';

// Wallet connect node specific data
interface WalletConnectNodeData extends BaseNodeData {
  walletOptions: string[];
  selectedWallet: string;
  isConnected: boolean;
}

// Wallet connect node component
const WalletConnectNode: React.FC<NodeProps<WalletConnectNodeData>> = ({ id, data, selected }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { 
    connect, 
    disconnect, 
    isConnected, 
    isConnecting, 
    activeAccount,
    accounts,
    error 
  } = useWallet();
  
  const [selectedWallet, setSelectedWallet] = useState<string>(data.selectedWallet || 'Polkadot.js');
  const [connecting, setConnecting] = useState<boolean>(false);

  // Update node data when connection status changes
  useEffect(() => {
    data.isConnected = isConnected;
  }, [data, isConnected]);

  // Handle wallet connection
  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connect(selectedWallet as WalletType);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    } finally {
      setConnecting(false);
    }
  };

  // Handle wallet disconnection
  const handleDisconnect = () => {
    disconnect();
  };

  // Handle wallet selection change
  const handleWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWallet(e.target.value);
    data.selectedWallet = e.target.value;
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      nodeColor="#8b5cf6" // Purple for wallet nodes
      icon={<FaWallet />}
      inputHandles={[]}
      outputHandles={[{ id: 'output', position: Position.Right }]}
    >
      <div className="space-y-3">
        {/* Wallet selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Wallet Provider</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={selectedWallet}
            onChange={handleWalletChange}
            disabled={isConnected}
          >
            {data.walletOptions.map((wallet) => (
              <option key={wallet} value={wallet}>
                {wallet}
              </option>
            ))}
          </select>
        </div>

        {/* Connection status */}
        {isConnected && activeAccount && (
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="font-medium">Connected</span>
            </div>
            <div className="mt-1 truncate">
              {activeAccount.meta.name || 'Unknown'}
            </div>
            <div className="mt-1 text-xs truncate text-gray-500">
              {activeAccount.address.substring(0, 12)}...{activeAccount.address.substring(activeAccount.address.length - 6)}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && !isConnected && (
          <div className="text-sm text-red-500 mt-1">
            {error}
          </div>
        )}

        {/* Action button */}
        <button
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isConnected
              ? 'bg-red-500 hover:bg-red-600'
              : isConnecting || connecting
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors duration-200`}
          onClick={isConnected ? handleDisconnect : handleConnect}
          disabled={isConnecting || connecting}
        >
          {isConnected
            ? 'Disconnect'
            : isConnecting || connecting
            ? 'Connecting...'
            : 'Connect Wallet'}
        </button>

        {/* Available accounts count */}
        {isConnected && accounts.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''} available
          </div>
        )}
      </div>
    </BaseNode>
  );
};

export default memo(WalletConnectNode);
