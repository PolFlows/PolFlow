'use client';

import React, { useCallback, useMemo, useState, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  ConnectionLineType,
  Panel,
  ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';

// Node components
import WalletConnectNode from './nodes/WalletConnectNode';
import AssetSelectorNode from './nodes/AssetSelectorNode';
import XCMTransferNode from './nodes/XCMTransferNode';
import ConditionalNode from './nodes/ConditionalNode';
import DEXAggregatorNode from './nodes/DEXAggregatorNode';
import LiquidityPoolNode from './nodes/LiquidityPoolNode';
import YieldFarmNode from './nodes/YieldFarmNode';
import OracleFeedNode from './nodes/OracleFeedNode';
import GovernanceNode from './nodes/GovernanceNode';
import AlertNode from './nodes/AlertNode';

// Edge components
import DataFlowEdge from './edges/DataFlowEdge';
import AssetFlowEdge from './edges/AssetFlowEdge';
import LogicFlowEdge from './edges/LogicFlowEdge';
import CrossChainEdge from './edges/CrossChainEdge';

export interface FlowBuilderProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
  onPaneClick?: (event: React.MouseEvent) => void;
  onDrop?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
}

const FlowBuilder: React.FC<FlowBuilderProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  onDrop,
  onDragOver,
}) => {
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [showMinimap, setShowMinimap] = useState<boolean>(false);
  const [connectionActive, setConnectionActive] = useState<boolean>(false);
  
  // Define custom node types
  const nodeTypes = useMemo<NodeTypes>(() => ({
    walletConnect: WalletConnectNode,
    assetSelector: AssetSelectorNode,
    xcmTransfer: XCMTransferNode,
    conditional: ConditionalNode,
    dexAggregator: DEXAggregatorNode,
    liquidityPool: LiquidityPoolNode,
    yieldFarm: YieldFarmNode,
    oracleFeed: OracleFeedNode,
    governance: GovernanceNode,
    alert: AlertNode,
  }), []);
  
  // Define custom edge types
  const edgeTypes = useMemo<EdgeTypes>(() => ({
    dataFlow: DataFlowEdge,
    assetFlow: AssetFlowEdge,
    logicFlow: LogicFlowEdge,
    crossChain: CrossChainEdge,
  }), []);

  // Handle connection start/end for animation effects
  const onConnectStart = useCallback(() => {
    setConnectionActive(true);
  }, []);

  const onConnectEnd = useCallback(() => {
    setConnectionActive(false);
  }, []);

  // Custom connection styling based on connection type
  const handleConnect = useCallback((params: Connection) => {
    // Get the source and target nodes to determine appropriate edge type
    const sourceNode = nodes.find(node => node.id === params.source);
    const targetNode = nodes.find(node => node.id === params.target);
    
    let edgeType = "default";
    
    // Determine edge type based on node types
    if (sourceNode && targetNode) {
      if (sourceNode.type === 'oracleFeed' || targetNode.type === 'conditional') {
        edgeType = 'dataFlow';
      } else if (sourceNode.type === 'walletConnect' || sourceNode.type === 'assetSelector' || 
                targetNode.type === 'dexAggregator' || targetNode.type === 'liquidityPool') {
        edgeType = 'assetFlow';
      } else if (sourceNode.type === 'conditional' || targetNode.type === 'alert') {
        edgeType = 'logicFlow';
      } else if (sourceNode.type === 'xcmTransfer' || targetNode.type === 'xcmTransfer') {
        edgeType = 'crossChain';
      }
    }
    
    // Pass along the determined edge type
    onConnect({
      ...params,
      type: edgeType
    });
  }, [nodes, onConnect]);
  
  // Toggle minimap visibility
  const toggleMinimap = useCallback(() => {
    setShowMinimap(prev => !prev);
  }, []);

  return (
    <div className="w-full h-full overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        snapToGrid={true}
        snapGrid={[20, 20]}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        connectionLineType={ConnectionLineType.Bezier}
        connectionLineStyle={{
          stroke: connectionActive ? '#ff5722' : '#3b82f6',
          strokeWidth: 2,
          strokeDasharray: connectionActive ? '5 5' : '',
          animation: connectionActive ? 'flowLineDash 1s linear infinite' : 'none',
        }}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Control', 'Meta']}
        selectionKeyCode={['Shift']}
        className="flow-builder-canvas bg-[#0D0E12]"
      >
        {/* Dynamic Grid Pattern Background */}
        <Background
          variant="dots"
          gap={20}
          size={1}
          color="rgba(70, 70, 90, 0.4)"
          className="flow-background"
        />
        
        {/* Custom UI Controls */}
        <Panel position="top-left" className="flow-stats">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#181A22] bg-opacity-80 backdrop-blur-sm rounded-md shadow-glow px-4 py-2 text-xs text-blue-300"
          >
            <div className="flex items-center space-x-3">
              <div>
                <span className="text-gray-400">Nodes:</span> {nodes.length}
              </div>
              <div className="h-3 border-r border-gray-700"></div>
              <div>
                <span className="text-gray-400">Connections:</span> {edges.length}
              </div>
            </div>
          </motion.div>
        </Panel>
        
        {/* Enhanced Flow Controls */}
        <Controls 
          position="bottom-right"
          showInteractive={true}
          className="flow-controls bg-[#181A22] bg-opacity-80 backdrop-blur-sm border border-gray-800 rounded-md shadow-glow overflow-hidden"
        >
          <button
            className="bg-[#181A22] border-0 p-2 text-gray-400 hover:text-blue-400 transition-colors"
            onClick={toggleMinimap}
            title="Toggle Minimap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <rect x="8" y="8" width="8" height="8" rx="1" ry="1"></rect>
            </svg>
          </button>
        </Controls>
        
        {/* Animated Minimap */}
        <AnimatePresence>
          {showMinimap && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-4"
            >
              <MiniMap
                nodeStrokeWidth={3}
                zoomable
                pannable
                nodeColor={(node) => {
                  switch (node.type) {
                    case 'walletConnect': return '#3b82f6';
                    case 'assetSelector': return '#10b981';
                    case 'xcmTransfer': return '#8b5cf6';
                    case 'conditional': return '#f97316';
                    case 'dexAggregator': return '#06b6d4';
                    case 'liquidityPool': return '#10b981';
                    case 'yieldFarm': return '#eab308';
                    case 'oracleFeed': return '#ec4899';
                    case 'governance': return '#6366f1';
                    case 'alert': return '#ef4444';
                    default: return '#71717a';
                  }
                }}
                maskColor="rgba(13, 14, 18, 0.7)"
                className="bg-[#181A22] border border-gray-800 rounded-md shadow-glow"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </ReactFlow>
      
      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes flowLineDash {
          from {
            stroke-dashoffset: 10;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        
        .flow-builder-canvas .react-flow__node {
          transition: all 0.2s ease;
        }
        
        .flow-builder-canvas .react-flow__node:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
        }
        
        .flow-builder-canvas .react-flow__handle {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #3b82f6;
          border: 2px solid #1e293b;
          transition: all 0.2s ease;
        }
        
        .flow-builder-canvas .react-flow__handle:hover {
          background-color: #ff5722;
          transform: scale(1.3);
        }
        
        .shadow-glow {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
        }
        
        .flow-background {
          background-image: radial-gradient(circle at 1px 1px, rgba(70, 70, 90, 0.4) 1px, transparent 0);
        }
      `}</style>
    </div>
  );
};

export default FlowBuilder;