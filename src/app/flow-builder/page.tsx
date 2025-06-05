'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaSave, FaFolderOpen, FaFileExport, FaFileImport, 
  FaPlay, FaWallet, FaSearch, FaPlus, FaTimes,
  FaCode, FaExchangeAlt, FaRandom, FaWater, FaSeedling,
  FaChartLine, FaGavel, FaBell
} from 'react-icons/fa';
import { ReactFlowProvider } from 'reactflow';
import { motion } from 'framer-motion';
import FlowBuilder from '@/components/FlowBuilder';
import { useFlow } from '@/contexts/FlowContext';
import { usePolkadot } from '@/contexts/PolkadotContext';
import { useWallet } from '@/contexts/WalletContext';

// Node categories for the palette
const NODE_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'auth', name: 'Authentication' },
  { id: 'assets', name: 'Assets' },
  { id: 'transfers', name: 'Transfers' },
  { id: 'logic', name: 'Logic' },
  { id: 'trading', name: 'Trading' },
  { id: 'liquidity', name: 'Liquidity' },
  { id: 'yield', name: 'Yield' },
  { id: 'data', name: 'Data' },
  { id: 'governance', name: 'Governance' },
  { id: 'notifications', name: 'Notifications' },
];

// Node types with their metadata
const NODE_TYPES = {
  walletConnect: { 
    name: 'Wallet Connect',
    description: 'Connect to Polkadot wallets',
    category: 'auth',
    icon: <FaWallet />,
  },
  assetSelector: { 
    name: 'Asset Selector',
    description: 'Select chain and asset',
    category: 'assets',
    icon: <FaExchangeAlt />,
  },
  xcmTransfer: { 
    name: 'XCM Transfer',
    description: 'Cross-chain asset transfers',
    category: 'transfers',
    icon: <FaExchangeAlt />,
  },
  conditional: { 
    name: 'Conditional',
    description: 'Logic gates for automation',
    category: 'logic',
    icon: <FaRandom />,
  },
  dexAggregator: { 
    name: 'DEX Aggregator',
    description: 'Best-price swaps across DEXs',
    category: 'trading',
    icon: <FaExchangeAlt />,
  },
  liquidityPool: { 
    name: 'Liquidity Pool',
    description: 'Manage LP positions',
    category: 'liquidity',
    icon: <FaWater />,
  },
  yieldFarm: { 
    name: 'Yield Farm',
    description: 'Auto-compound yields',
    category: 'yield',
    icon: <FaSeedling />,
  },
  oracleFeed: { 
    name: 'Oracle Feed',
    description: 'Real-time price data',
    category: 'data',
    icon: <FaChartLine />,
  },
  governance: { 
    name: 'Governance',
    description: 'Automate voting',
    category: 'governance',
    icon: <FaGavel />,
  },
  alert: { 
    name: 'Alert',
    description: 'Notifications for events',
    category: 'notifications',
    icon: <FaBell />,
  },
};

const FlowBuilderPage = () => {
  const router = useRouter();
  const { 
    nodes, edges, onNodesChange, onEdgesChange, 
    onConnect, addNode, saveWorkflow, loadWorkflow, 
    executeWorkflow, clearCanvas 
  } = useFlow();
  const { activeChain } = usePolkadot();
  const { isConnected, connect } = useWallet();
  
  // State for UI controls
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  
  // Ref for the flow builder container
  const reactFlowWrapper = useRef(null);
  
  // Handle node drag over
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  // Handle node drop
  const onDrop = useCallback((event) => {
    event.preventDefault();
    
    if (!reactFlowWrapper.current) return;
    
    const type = event.dataTransfer.getData('application/reactflow/type');
    if (!type) return;
    
    const position = {
      x: event.clientX - reactFlowWrapper.current.getBoundingClientRect().left,
      y: event.clientY - reactFlowWrapper.current.getBoundingClientRect().top,
    };
    
    addNode(type, position);
  }, [addNode]);
  
  // Handle drag start for node palette items
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  
  // Filter nodes by category and search query
  const filteredNodes = Object.entries(NODE_TYPES)
    .filter(([type, data]) => {
      const matchesCategory = activeCategory === 'all' || data.category === activeCategory;
      const matchesSearch = !searchQuery || 
                           type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           data.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

  // Handle saving workflow
  const handleSaveWorkflow = () => {
    if (!workflowName.trim()) {
      alert('Please enter a name for your workflow');
      return;
    }
    
    saveWorkflow(workflowName);
    setSaveModalOpen(false);
    setWorkflowName('');
  };
  
  // Handle execution of workflow
  const handleExecute = () => {
    if (!isConnected) {
      connect();
      return;
    }
    
    executeWorkflow();
  };

  return (
    <div className="h-screen flex flex-col bg-[#0D0E12] text-gray-200">
      {/* Header Bar */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-4 bg-[#0F1014]">
        <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
          Polkadot DeFi Flow Builder
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center text-sm"
            onClick={() => setSaveModalOpen(true)}
          >
            <FaSave className="mr-1.5" /> Save
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center text-sm"
          >
            <FaFolderOpen className="mr-1.5" /> Load
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center text-sm"
          >
            <FaFileExport className="mr-1.5" /> Export
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center text-sm"
          >
            <FaFileImport className="mr-1.5" /> Import
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-md flex items-center text-sm ml-2"
          >
            Templates
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className={`px-3 py-1.5 rounded-md flex items-center text-sm ml-2 ${
              isConnected ? 'bg-green-600' : 'bg-amber-600 hover:bg-amber-700'
            }`}
            onClick={!isConnected ? () => connect() : undefined}
          >
            <FaWallet className="mr-1.5" /> 
            {isConnected ? 'Connected' : 'Connect'}
          </motion.button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Node Palette */}
        <div className="w-64 bg-[#13141A] border-r border-gray-800 flex flex-col">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-3">Node Palette</h2>
            
            {/* Search Box */}
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A1C24] border border-gray-800 rounded-md py-2 pl-9 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            
            {/* Category Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {NODE_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-2.5 py-1 text-xs rounded-full ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#1A1C24] text-gray-400 hover:bg-[#23252F]'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Node List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {filteredNodes.map(([type, data]) => (
              <motion.div
                key={type}
                draggable
                onDragStart={(event) => onDragStart(event, type)}
                whileHover={{ scale: 1.02, y: -2 }}
                className="cursor-move p-3 rounded-md border border-gray-800 bg-[#1A1C24] hover:border-blue-500 hover:bg-[#1F2128]"
              >
                <div className="flex items-center">
                  <div className="mr-3 text-blue-500">
                    {data.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{data.name}</div>
                    <div className="text-xs text-gray-500">{data.description}</div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {filteredNodes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No nodes match your search
              </div>
            )}
          </div>
          
          {/* Clear Canvas Button */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={clearCanvas}
              className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm font-medium flex items-center justify-center"
            >
              <FaTimes className="mr-2" /> Clear Canvas
            </button>
          </div>
        </div>
        
        {/* Main Flow Builder Area */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <FlowBuilder
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={(_, node) => {
                setSelectedNode(node);
                setSelectedEdge(null);
              }}
              onEdgeClick={(_, edge) => {
                setSelectedEdge(edge);
                setSelectedNode(null);
              }}
              onPaneClick={() => {
                setSelectedNode(null);
                setSelectedEdge(null);
              }}
            />
          </ReactFlowProvider>
        </div>
        
        {/* Right Sidebar - Properties Panel */}
        <div className="w-72 bg-[#13141A] border-l border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold">Properties</h2>
            
            {selectedNode ? (
              <div className="mt-3">
                <h3 className="font-medium text-blue-400">{selectedNode.data.label}</h3>
                <p className="text-sm text-gray-500 mb-3">{NODE_TYPES[selectedNode.type]?.description || selectedNode.type}</p>
                <div className="space-y-3">
                  {/* Dynamic properties would be rendered here based on the selected node */}
                  <div className="text-sm text-gray-400">
                    Select properties from the node to edit configuration
                  </div>
                </div>
              </div>
            ) : selectedEdge ? (
              <div className="mt-3">
                <h3 className="font-medium text-purple-400">Edge Properties</h3>
                <div className="mt-2 text-sm text-gray-500">
                  Connection from {selectedEdge.source} to {selectedEdge.target}
                </div>
              </div>
            ) : (
              <div className="mt-3 text-gray-500 text-sm">
                Select a node or edge to edit properties
              </div>
            )}
          </div>
          
          {/* Workflow Information */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <h3 className="text-base font-medium mb-2">Workflow Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nodes:</span>
                  <span>{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Edges:</span>
                  <span>{edges.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Active Chain:</span>
                  <span className="text-blue-400">{activeChain}</span>
                </div>
              </div>
            </div>
            
            {/* Execution Results would go here */}
          </div>
          
          {/* Execute Button */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleExecute}
              disabled={nodes.length === 0}
              className={`
                w-full py-3 rounded-md text-white font-medium
                flex items-center justify-center
                ${nodes.length === 0 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}
              `}
            >
              <FaPlay className="mr-2" /> Execute Workflow
            </button>
            
            {!isConnected && (
              <div className="mt-2 text-amber-500 text-xs text-center">
                Connect wallet to execute workflows
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Save Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#13141A] rounded-lg shadow-lg w-full max-w-md p-6 border border-gray-800"
          >
            <h2 className="text-xl font-bold mb-4">Save Workflow</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Workflow Name</label>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="My Awesome Strategy"
                className="w-full bg-[#1A1C24] border border-gray-800 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWorkflow}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
              >
                Save Workflow
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FlowBuilderPage;