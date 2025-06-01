import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  MarkerType,
  Connection,
  Edge,
  NodeTypes,
  EdgeTypes,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTheme } from '@/contexts/ThemeContext';
import { usePolkadot } from '@/contexts/PolkadotContext';
import { useWallet } from '@/contexts/WalletContext';
import { v4 as uuidv4 } from 'uuid';

// Custom Node Components
import WalletConnectNode from './nodes/WalletConnectNode';
import AssetSelectorNode from './nodes/AssetSelectorNode';
import XCMTransferNode from './nodes/XCMTransferNode';
import ConditionalNode from './nodes/ConditionalNode';
import DEXAggregatorNode from './nodes/DEXAggregatorNode';
// import LiquidityPoolNode from './nodes/LiquidityPoolNode';
// import YieldFarmNode from './nodes/YieldFarmNode';
import OracleFeedNode from './nodes/OracleFeedNode';
// import GovernanceNode from './nodes/GovernanceNode';
// import AlertNode from './nodes/AlertNode';

// Custom Edge Components
import DataFlowEdge from './edges/DataFlowEdge';
import AssetFlowEdge from './edges/AssetFlowEdge';
import LogicFlowEdge from './edges/LogicFlowEdge';
import CrossChainEdge from './edges/CrossChainEdge';

// Node type definitions
const NODE_TYPES: NodeTypes = {
  walletConnect: WalletConnectNode,
  assetSelector: AssetSelectorNode,
  xcmTransfer: XCMTransferNode,
  conditional: ConditionalNode,
  dexAggregator: DEXAggregatorNode,
  // liquidityPool: LiquidityPoolNode,
  // yieldFarm: YieldFarmNode,
  oracleFeed: OracleFeedNode,
  // governance: GovernanceNode,
  // alert: AlertNode,
};

// Edge type definitions
const EDGE_TYPES: EdgeTypes = {
  dataFlow: DataFlowEdge,
  assetFlow: AssetFlowEdge,
  logicFlow: LogicFlowEdge,
  crossChain: CrossChainEdge,
};

// Node templates for the sidebar
const NODE_TEMPLATES = [
  {
    type: 'walletConnect',
    label: 'Wallet Connect',
    description: 'Connect to Polkadot wallets',
    category: 'Authentication',
    data: {
      walletOptions: ['Polkadot.js', 'Talisman', 'Nova', 'SubWallet'],
      selectedWallet: 'Polkadot.js',
      isConnected: false,
    },
  },
  {
    type: 'assetSelector',
    label: 'Asset Selector',
    description: 'Select chain and asset',
    category: 'Assets',
    data: {
      chains: ['Polkadot', 'Kusama', 'Asset Hub', 'Acala', 'Moonbeam', 'Astar'],
      assets: ['DOT', 'KSM', 'USDC', 'USDT', 'GLMR', 'ASTR', 'ACA'],
      selectedChain: 'Polkadot',
      selectedAsset: 'DOT',
      amount: '0',
    },
  },
  {
    type: 'xcmTransfer',
    label: 'XCM Transfer',
    description: 'Cross-chain asset transfers',
    category: 'Transfers',
    data: {
      sourceChain: 'Polkadot',
      destinationChain: 'Asset Hub',
      xcmVersion: 'v3',
      feeCalculation: 'auto',
      hrmpStatus: 'active',
    },
  },
  {
    type: 'conditional',
    label: 'Conditional',
    description: 'Logic gates for automation',
    category: 'Logic',
    data: {
      condition: 'greater_than',
      value: '0',
      timeDelay: '0',
      logicType: 'if',
    },
  },
  {
    type: 'dexAggregator',
    label: 'DEX Aggregator',
    description: 'Best-price swaps across DEXs',
    category: 'Trading',
    data: {
      dexes: ['HydraDX', 'StellaSwap', 'Beamswap'],
      selectedDexes: ['HydraDX'],
      slippageTolerance: '0.5',
      routingStrategy: 'best_price',
    },
  },
  {
    type: 'liquidityPool',
    label: 'Liquidity Pool',
    description: 'Manage LP positions',
    category: 'Liquidity',
    data: {
      poolType: '50_50',
      pairA: 'DOT',
      pairB: 'USDC',
      stakingPeriod: '0',
      autoCompound: false,
    },
  },
  {
    type: 'yieldFarm',
    label: 'Yield Farm',
    description: 'Auto-compound yields',
    category: 'Yield',
    data: {
      platforms: ['Bifrost', 'Parallel', 'Acala'],
      selectedPlatform: 'Bifrost',
      riskLevel: 'medium',
      minAPY: '5',
      compoundFrequency: 'daily',
    },
  },
  {
    type: 'oracleFeed',
    label: 'Oracle Feed',
    description: 'Real-time price data',
    category: 'Data',
    data: {
      dataSource: 'Subscan',
      updateFrequency: '15s',
      customEndpoint: '',
      dataType: 'price',
    },
  },
  {
    type: 'governance',
    label: 'Governance',
    description: 'Automate voting',
    category: 'Governance',
    data: {
      governanceType: 'OpenGov',
      proposalId: '',
      votingPower: '100',
      delegationEnabled: false,
    },
  },
  {
    type: 'alert',
    label: 'Alert',
    description: 'Notifications for events',
    category: 'Notifications',
    data: {
      alertType: 'Telegram',
      threshold: '5',
      message: 'Alert triggered',
      enabled: true,
    },
  },
];

// Edge configurations
const EDGE_CONFIGS = {
  dataFlow: {
    type: 'dataFlow',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    animated: true,
  },
  assetFlow: {
    type: 'assetFlow',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
    style: { stroke: '#10b981', strokeWidth: 2 },
    animated: true,
  },
  logicFlow: {
    type: 'logicFlow',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
    style: { stroke: '#f97316', strokeWidth: 2 },
    animated: true,
  },
  crossChain: {
    type: 'crossChain',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
    style: { stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5,5' },
    animated: true,
  },
};

// Main FlowBuilder component
const FlowBuilder: React.FC = () => {
  const { theme } = useTheme();
  const { api } = usePolkadot();
  const { accounts, activeAccount } = useWallet();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Extract unique categories from node templates
  useEffect(() => {
    const uniqueCategories = Array.from(
      new Set(NODE_TEMPLATES.map((node) => node.category))
    );
    setCategories(['All', ...uniqueCategories]);
  }, []);

  // Handle node drag over
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node drop
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds || !reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow/type');
      const nodeTemplate = NODE_TEMPLATES.find((t) => t.type === type);
      if (!nodeTemplate) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `${type}-${uuidv4()}`,
        type,
        position,
        data: { ...nodeTemplate.data, label: nodeTemplate.label },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Handle connections between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      // Determine edge type based on source and target node types
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);
      
      if (!sourceNode || !targetNode) return;
      
      let edgeType = 'dataFlow';
      
      // Logic for determining edge type
      if (
        sourceNode.type === 'oracleFeed' || 
        targetNode.type === 'conditional'
      ) {
        edgeType = 'dataFlow';
      } else if (
        sourceNode.type === 'walletConnect' || 
        sourceNode.type === 'assetSelector' ||
        targetNode.type === 'dexAggregator' ||
        targetNode.type === 'liquidityPool'
      ) {
        edgeType = 'assetFlow';
      } else if (
        sourceNode.type === 'conditional' ||
        targetNode.type === 'alert'
      ) {
        edgeType = 'logicFlow';
      } else if (
        sourceNode.type === 'xcmTransfer' ||
        targetNode.type === 'xcmTransfer'
      ) {
        edgeType = 'crossChain';
      }
      
      const edgeConfig = EDGE_CONFIGS[edgeType as keyof typeof EDGE_CONFIGS];
      
      setEdges((eds) => 
        addEdge({
          ...params,
          ...edgeConfig,
          id: `e-${uuidv4()}`,
        }, eds)
      );
    },
    [nodes, setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      setSelectedEdge(null);
    },
    [setSelectedNode]
  );

  // Handle edge selection
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge);
      setSelectedNode(null);
    },
    [setSelectedEdge]
  );

  // Handle node data update
  const onNodeDataChange = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Handle workflow save
  const saveWorkflow = useCallback(() => {
    if (nodes.length === 0) return;
    
    const workflow = {
      nodes,
      edges,
      name: `Workflow-${new Date().toISOString()}`,
      created: new Date().toISOString(),
    };
    
    // Save to localStorage for demo purposes
    // In a real app, this would save to a backend
    const savedWorkflows = JSON.parse(
      localStorage.getItem('polkadotDeFiWorkflows') || '[]'
    );
    savedWorkflows.push(workflow);
    localStorage.setItem(
      'polkadotDeFiWorkflows',
      JSON.stringify(savedWorkflows)
    );
    
    alert('Workflow saved successfully!');
  }, [nodes, edges]);

  // Handle workflow load
  const loadWorkflow = useCallback(() => {
    // In a real app, this would load from a backend
    const savedWorkflows = JSON.parse(
      localStorage.getItem('polkadotDeFiWorkflows') || '[]'
    );
    
    if (savedWorkflows.length === 0) {
      alert('No saved workflows found');
      return;
    }
    
    // For demo purposes, just load the most recent workflow
    const latestWorkflow = savedWorkflows[savedWorkflows.length - 1];
    
    setNodes(latestWorkflow.nodes);
    setEdges(latestWorkflow.edges);
    
    alert(`Loaded workflow: ${latestWorkflow.name}`);
  }, [setNodes, setEdges]);

  // Handle node drag start from sidebar
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string
  ) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="h-screen w-full flex">
      {/* Sidebar */}
      <div className={`w-64 bg-${theme === 'dark' ? 'gray-900' : 'gray-100'} p-4 overflow-y-auto border-r border-${theme === 'dark' ? 'gray-700' : 'gray-200'}`}>
        <h2 className="text-xl font-bold mb-4">Node Palette</h2>
        
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-2 py-1 text-xs rounded-full ${
                activeCategory === category
                  ? 'bg-blue-500 text-white'
                  : `bg-${theme === 'dark' ? 'gray-700' : 'gray-200'} text-${theme === 'dark' ? 'gray-200' : 'gray-700'}`
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Node templates */}
        <div className="space-y-2">
          {NODE_TEMPLATES.filter(
            (node) => activeCategory === 'All' || node.category === activeCategory
          ).map((node) => (
            <div
              key={node.type}
              className={`p-3 rounded-md cursor-move border border-${theme === 'dark' ? 'gray-700' : 'gray-300'} bg-${theme === 'dark' ? 'gray-800' : 'white'} hover:bg-${theme === 'dark' ? 'gray-700' : 'gray-100'}`}
              draggable
              onDragStart={(event) => onDragStart(event, node.type)}
            >
              <div className="font-medium">{node.label}</div>
              <div className={`text-xs text-${theme === 'dark' ? 'gray-400' : 'gray-500'}`}>
                {node.description}
              </div>
            </div>
          ))}
        </div>
        
        {/* Workflow actions */}
        <div className="mt-6 space-y-2">
          <button
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={saveWorkflow}
          >
            Save Workflow
          </button>
          <button
            className="w-full py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            onClick={loadWorkflow}
          >
            Load Workflow
          </button>
        </div>
      </div>
      
      {/* Main flow area */}
      <div className="flex-1 h-full" ref={reactFlowWrapper}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            fitView
            attributionPosition="bottom-right"
            minZoom={0.2}
            maxZoom={4}
          >
            <Background
              color={theme === 'dark' ? '#374151' : '#e5e7eb'}
              gap={16}
              size={1}
            />
            <Controls />
            <Panel position="top-right">
              <div className={`p-3 rounded-md bg-${theme === 'dark' ? 'gray-800' : 'white'} border border-${theme === 'dark' ? 'gray-700' : 'gray-200'}`}>
                <div className="text-sm font-medium mb-1">
                  {activeAccount ? `Connected: ${activeAccount.meta.name}` : 'Not Connected'}
                </div>
                <div className={`text-xs text-${theme === 'dark' ? 'gray-400' : 'gray-500'}`}>
                  {api ? 'API Connected' : 'API Disconnected'}
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </ReactFlowProvider>
      </div>
      
      {/* Properties panel */}
      {(selectedNode || selectedEdge) && (
        <div className={`w-72 bg-${theme === 'dark' ? 'gray-900' : 'gray-100'} p-4 overflow-y-auto border-l border-${theme === 'dark' ? 'gray-700' : 'gray-200'}`}>
          <h2 className="text-xl font-bold mb-4">Properties</h2>
          
          {selectedNode && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">{selectedNode.data.label}</h3>
                <div className={`text-xs text-${theme === 'dark' ? 'gray-400' : 'gray-500'}`}>
                  {selectedNode.type}
                </div>
              </div>
              
              {/* Dynamic properties based on node type */}
              {Object.entries(selectedNode.data).map(([key, value]) => {
                if (key === 'label') return null;
                
                // Handle different property types
                if (Array.isArray(value) && typeof value[0] === 'string') {
                  // Multi-select dropdown
                  return (
                    <div key={key} className="space-y-1">
                      <label className="text-sm font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                      </label>
                      <select
                        className={`w-full p-2 rounded-md bg-${theme === 'dark' ? 'gray-800' : 'white'} border border-${theme === 'dark' ? 'gray-700' : 'gray-300'}`}
                        value={selectedNode.data[`selected${key.charAt(0).toUpperCase() + key.slice(1)}`] || ''}
                        onChange={(e) => {
                          onNodeDataChange(selectedNode.id, {
                            [`selected${key.charAt(0).toUpperCase() + key.slice(1)}`]: e.target.value,
                          });
                        }}
                      >
                        {(value as string[]).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                } else if (typeof value === 'boolean') {
                  // Checkbox
                  return (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${selectedNode.id}-${key}`}
                        checked={value as boolean}
                        onChange={(e) => {
                          onNodeDataChange(selectedNode.id, {
                            [key]: e.target.checked,
                          });
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`${selectedNode.id}-${key}`} className="text-sm font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                      </label>
                    </div>
                  );
                } else {
                  // Text input or select for string/number values
                  return (
                    <div key={key} className="space-y-1">
                      <label className="text-sm font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                      </label>
                      {typeof value === 'string' && ['greater_than', 'less_than', 'equals', 'not_equals'].includes(value) ? (
                        <select
                          className={`w-full p-2 rounded-md bg-${theme === 'dark' ? 'gray-800' : 'white'} border border-${theme === 'dark' ? 'gray-700' : 'gray-300'}`}
                          value={value as string}
                          onChange={(e) => {
                            onNodeDataChange(selectedNode.id, {
                              [key]: e.target.value,
                            });
                          }}
                        >
                          <option value="greater_than">Greater Than</option>
                          <option value="less_than">Less Than</option>
                          <option value="equals">Equals</option>
                          <option value="not_equals">Not Equals</option>
                        </select>
                      ) : (
                        <input
                          type={typeof value === 'number' ? 'number' : 'text'}
                          value={value as string | number}
                          onChange={(e) => {
                            onNodeDataChange(selectedNode.id, {
                              [key]: e.target.value,
                            });
                          }}
                          className={`w-full p-2 rounded-md bg-${theme === 'dark' ? 'gray-800' : 'white'} border border-${theme === 'dark' ? 'gray-700' : 'gray-300'}`}
                        />
                      )}
                    </div>
                  );
                }
              })}
            </div>
          )}
          
          {selectedEdge && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Edge Properties</h3>
                <div className={`text-xs text-${theme === 'dark' ? 'gray-400' : 'gray-500'}`}>
                  {selectedEdge.type || 'Default Edge'}
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Edge Type</label>
                <select
                  className={`w-full p-2 rounded-md bg-${theme === 'dark' ? 'gray-800' : 'white'} border border-${theme === 'dark' ? 'gray-700' : 'gray-300'}`}
                  value={selectedEdge.type || 'default'}
                  onChange={(e) => {
                    const edgeType = e.target.value as keyof typeof EDGE_CONFIGS;
                    const edgeConfig = EDGE_CONFIGS[edgeType];
                    
                    setEdges((eds) =>
                      eds.map((edge) => {
                        if (edge.id === selectedEdge.id) {
                          return {
                            ...edge,
                            ...edgeConfig,
                          };
                        }
                        return edge;
                      })
                    );
                  }}
                >
                  <option value="dataFlow">Data Flow</option>
                  <option value="assetFlow">Asset Flow</option>
                  <option value="logicFlow">Logic Flow</option>
                  <option value="crossChain">Cross-Chain</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Animation</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${selectedEdge.id}-animated`}
                    checked={!!selectedEdge.animated}
                    onChange={(e) => {
                      setEdges((eds) =>
                        eds.map((edge) => {
                          if (edge.id === selectedEdge.id) {
                            return {
                              ...edge,
                              animated: e.target.checked,
                            };
                          }
                          return edge;
                        })
                      );
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={`${selectedEdge.id}-animated`} className="text-sm">
                    Enable Animation
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlowBuilder;
