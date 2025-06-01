
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { 
  Node, 
  Edge, 
  NodeChange, 
  EdgeChange, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge, 
  Connection,
  MarkerType,
  useNodesState,
  useEdgesState
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { usePolkadot } from './PolkadotContext';
import { useWallet } from './WalletContext';

// Define edge types with their styling
export const EDGE_TYPES = {
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

// Node templates for the workflow builder
export const NODE_TEMPLATES = [
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

// Workflow interface
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  created: string;
  updated: string;
}

// FlowContext interface
interface FlowContextState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  getNodeById: (nodeId: string) => Node | undefined;
  getEdgeById: (edgeId: string) => Edge | undefined;
  saveWorkflow: (name: string, description?: string) => Promise<string>;
  loadWorkflow: (workflowId: string) => Promise<boolean>;
  deleteWorkflow: (workflowId: string) => Promise<boolean>;
  getWorkflows: () => Workflow[];
  currentWorkflow: Workflow | null;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  isValidConnection: (connection: Connection) => boolean;
  clearCanvas: () => void;
  executeWorkflow: () => Promise<{ success: boolean; message: string }>;
  isExecuting: boolean;
  executionResults: any[];
  resetExecutionResults: () => void;
}

// Create context with default values
const FlowContext = createContext<FlowContextState>({
  nodes: [],
  edges: [],
  onNodesChange: () => {},
  onEdgesChange: () => {},
  onConnect: () => {},
  addNode: () => {},
  updateNodeData: () => {},
  deleteNode: () => {},
  deleteEdge: () => {},
  getNodeById: () => undefined,
  getEdgeById: () => undefined,
  saveWorkflow: async () => '',
  loadWorkflow: async () => false,
  deleteWorkflow: async () => false,
  getWorkflows: () => [],
  currentWorkflow: null,
  setCurrentWorkflow: () => {},
  isValidConnection: () => false,
  clearCanvas: () => {},
  executeWorkflow: async () => ({ success: false, message: 'Not implemented' }),
  isExecuting: false,
  executionResults: [],
  resetExecutionResults: () => {},
});

// FlowProvider props
interface FlowProviderProps {
  children: ReactNode;
}

// FlowProvider component
export const FlowProvider: React.FC<FlowProviderProps> = ({ children }) => {
  const { api, activeChain } = usePolkadot();
  const { activeAccount } = useWallet();
  
  // State for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // State for workflows and execution
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<any[]>([]);

  // Load saved workflows from localStorage on mount
  useEffect(() => {
    try {
      const savedWorkflows = JSON.parse(
        localStorage.getItem('polkadotDeFiWorkflows') || '[]'
      );
      setWorkflows(savedWorkflows);
    } catch (error) {
      console.error('Failed to load saved workflows:', error);
      setWorkflows([]);
    }
  }, []);

  // Handle connections between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isValidConnection(connection)) return;

      // Determine edge type based on source and target node types
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);
      
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
      
      const edgeConfig = EDGE_TYPES[edgeType as keyof typeof EDGE_TYPES];
      
      setEdges((eds) => 
        addEdge({
          ...connection,
          ...edgeConfig,
          id: `e-${uuidv4()}`,
        }, eds)
      );
    },
    [nodes, setEdges]
  );

  // Check if a connection is valid
  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      // Check if source and target exist
      if (!connection.source || !connection.target) return false;
      
      // Prevent connecting a node to itself
      if (connection.source === connection.target) return false;
      
      // Check if connection already exists
      const connectionExists = edges.some(
        (edge) => 
          edge.source === connection.source && 
          edge.target === connection.target
      );
      if (connectionExists) return false;
      
      // Get source and target nodes
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);
      
      if (!sourceNode || !targetNode) return false;
      
      // Define valid connections based on node types
      const validConnections: Record<string, string[]> = {
        'walletConnect': ['assetSelector', 'governance'],
        'assetSelector': ['xcmTransfer', 'dexAggregator', 'liquidityPool', 'yieldFarm'],
        'xcmTransfer': ['assetSelector', 'dexAggregator', 'liquidityPool', 'yieldFarm'],
        'conditional': ['xcmTransfer', 'dexAggregator', 'liquidityPool', 'yieldFarm', 'alert', 'governance'],
        'dexAggregator': ['assetSelector', 'liquidityPool', 'yieldFarm'],
        'liquidityPool': ['assetSelector', 'dexAggregator', 'yieldFarm'],
        'yieldFarm': ['assetSelector', 'liquidityPool'],
        'oracleFeed': ['conditional'],
        'governance': ['alert'],
        'alert': [],
      };
      
      // Check if target type is in the list of valid connections for the source type
      const validTargets = validConnections[sourceNode.type as string] || [];
      return validTargets.includes(targetNode.type as string);
    },
    [nodes, edges]
  );

  // Add a new node
  const addNode = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const nodeTemplate = NODE_TEMPLATES.find((t) => t.type === type);
      if (!nodeTemplate) return;
      
      const newNode = {
        id: `${type}-${uuidv4()}`,
        type,
        position,
        data: { ...nodeTemplate.data, label: nodeTemplate.label },
      };
      
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  // Update node data
  const updateNodeData = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Delete a node
  const deleteNode = useCallback(
    (nodeId: string) => {
      // Remove the node
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      
      // Remove any connected edges
      setEdges((eds) => 
        eds.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        )
      );
    },
    [setNodes, setEdges]
  );

  // Delete an edge
  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [setEdges]
  );

  // Get a node by ID
  const getNodeById = useCallback(
    (nodeId: string) => {
      return nodes.find((node) => node.id === nodeId);
    },
    [nodes]
  );

  // Get an edge by ID
  const getEdgeById = useCallback(
    (edgeId: string) => {
      return edges.find((edge) => edge.id === edgeId);
    },
    [edges]
  );

  // Save the current workflow
  const saveWorkflow = useCallback(
    async (name: string, description?: string): Promise<string> => {
      if (nodes.length === 0) {
        throw new Error('Cannot save an empty workflow');
      }
      
      try {
        const now = new Date().toISOString();
        
        // If we're updating an existing workflow
        if (currentWorkflow) {
          const updatedWorkflow = {
            ...currentWorkflow,
            name,
            description,
            nodes,
            edges,
            updated: now,
          };
          
          setWorkflows((wfs) =>
            wfs.map((wf) => (wf.id === currentWorkflow.id ? updatedWorkflow : wf))
          );
          
          setCurrentWorkflow(updatedWorkflow);
          
          // Save to localStorage
          localStorage.setItem(
            'polkadotDeFiWorkflows',
            JSON.stringify(
              workflows.map((wf) => (wf.id === currentWorkflow.id ? updatedWorkflow : wf))
            )
          );
          
          return currentWorkflow.id;
        }
        
        // Create a new workflow
        const newWorkflow: Workflow = {
          id: uuidv4(),
          name,
          description,
          nodes,
          edges,
          created: now,
          updated: now,
        };
        
        setWorkflows((wfs) => [...wfs, newWorkflow]);
        setCurrentWorkflow(newWorkflow);
        
        // Save to localStorage
        localStorage.setItem(
          'polkadotDeFiWorkflows',
          JSON.stringify([...workflows, newWorkflow])
        );
        
        return newWorkflow.id;
      } catch (error) {
        console.error('Failed to save workflow:', error);
        throw new Error('Failed to save workflow');
      }
    },
    [nodes, edges, currentWorkflow, workflows]
  );

  // Load a workflow
  const loadWorkflow = useCallback(
    async (workflowId: string): Promise<boolean> => {
      try {
        const workflow = workflows.find((wf) => wf.id === workflowId);
        
        if (!workflow) {
          throw new Error(`Workflow with ID ${workflowId} not found`);
        }
        
        setNodes(workflow.nodes);
        setEdges(workflow.edges);
        setCurrentWorkflow(workflow);
        
        return true;
      } catch (error) {
        console.error('Failed to load workflow:', error);
        return false;
      }
    },
    [workflows, setNodes, setEdges]
  );

  // Delete a workflow
  const deleteWorkflow = useCallback(
    async (workflowId: string): Promise<boolean> => {
      try {
        // Filter out the workflow to delete
        const updatedWorkflows = workflows.filter((wf) => wf.id !== workflowId);
        
        setWorkflows(updatedWorkflows);
        
        // If the current workflow is being deleted, clear it
        if (currentWorkflow && currentWorkflow.id === workflowId) {
          setCurrentWorkflow(null);
          clearCanvas();
        }
        
        // Save to localStorage
        localStorage.setItem(
          'polkadotDeFiWorkflows',
          JSON.stringify(updatedWorkflows)
        );
        
        return true;
      } catch (error) {
        console.error('Failed to delete workflow:', error);
        return false;
      }
    },
    [workflows, currentWorkflow]
  );

  // Get all workflows
  const getWorkflows = useCallback(() => {
    return workflows;
  }, [workflows]);

  // Clear the canvas
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setCurrentWorkflow(null);
  }, [setNodes, setEdges]);

  // Execute the current workflow
  const executeWorkflow = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (nodes.length === 0) {
      return { success: false, message: 'No workflow to execute' };
    }
    
    if (!api) {
      return { success: false, message: 'Not connected to blockchain' };
    }
    
    if (!activeAccount) {
      return { success: false, message: 'No active wallet account' };
    }
    
    try {
      setIsExecuting(true);
      setExecutionResults([]);
      
      // In a real implementation, this would execute the workflow
      // by traversing the nodes and edges and performing the actions
      
      // For demo purposes, we'll just simulate execution with a delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Add some sample results
      setExecutionResults([
        {
          nodeId: nodes[0]?.id,
          status: 'success',
          message: `Connected to ${activeAccount.meta.name}`,
        },
        {
          nodeId: nodes.find((n) => n.type === 'assetSelector')?.id,
          status: 'success',
          message: `Selected ${activeChain} / DOT`,
        },
      ]);
      
      setIsExecuting(false);
      return { success: true, message: 'Workflow executed successfully' };
    } catch (error) {
      console.error('Workflow execution failed:', error);
      setIsExecuting(false);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Workflow execution failed' 
      };
    }
  }, [nodes, edges, api, activeAccount, activeChain]);

  // Reset execution results
  const resetExecutionResults = useCallback(() => {
    setExecutionResults([]);
  }, []);

  // Provide the context value
  const contextValue: FlowContextState = {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNodeData,
    deleteNode,
    deleteEdge,
    getNodeById,
    getEdgeById,
    saveWorkflow,
    loadWorkflow,
    deleteWorkflow,
    getWorkflows,
    currentWorkflow,
    setCurrentWorkflow,
    isValidConnection,
    clearCanvas,
    executeWorkflow,
    isExecuting,
    executionResults,
    resetExecutionResults,
  };

  return (
    <FlowContext.Provider value={contextValue}>
      {children}
    </FlowContext.Provider>
  );
};

// Custom hook for using the Flow context
export const useFlow = () => useContext(FlowContext);

export default FlowContext;
