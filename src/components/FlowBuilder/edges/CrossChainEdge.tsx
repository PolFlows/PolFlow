import React, { memo } from 'react';
import { EdgeProps, MarkerType } from 'reactflow';
import BaseEdge, { BaseEdgeData } from './BaseEdge';

// Cross-chain edge data interface
interface CrossChainEdgeData extends BaseEdgeData {
  // Add any cross-chain specific properties here
  sourceChain?: string;
  targetChain?: string;
  protocol?: string; // e.g., 'XCM', 'IBC', etc.
  assetSymbol?: string;
}

// Cross-chain edge component for connecting nodes across different blockchain networks
const CrossChainEdge: React.FC<EdgeProps<CrossChainEdgeData>> = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
  selected,
}) => {
  // Cross-chain edges use purple color
  const crossChainColor = '#8b5cf6'; // Tailwind purple-500
  
  // Default cross-chain style with dashed line and animation
  const crossChainStyle = {
    stroke: crossChainColor,
    strokeWidth: 2,
    strokeDasharray: '5,5', // Dashed line to indicate cross-chain connection
    ...style,
  };

  // Default marker for cross-chain flow
  const defaultMarkerEnd = {
    type: MarkerType.ArrowClosed,
    color: crossChainColor,
    width: 20,
    height: 20,
  };

  // Generate label with chain information if available
  const edgeLabel = data?.sourceChain && data?.targetChain
    ? `${data.sourceChain} → ${data.targetChain}${data.assetSymbol ? ` (${data.assetSymbol})` : ''}`
    : data?.protocol
      ? `${data.protocol}`
      : data?.label;

  return (
    <BaseEdge
      id={id}
      source={source}
      target={target}
      sourceX={sourceX}
      sourceY={sourceY}
      targetX={targetX}
      targetY={targetY}
      sourcePosition={sourcePosition}
      targetPosition={targetPosition}
      data={{
        ...data,
        label: edgeLabel,
        animated: true, // Cross-chain edges are animated by default
        labelShowBg: true,
        labelBgStyle: {
          fill: '#8b5cf6',
          color: 'white',
          fillOpacity: 0.7,
        },
      }}
      style={crossChainStyle}
      selected={selected}
      markerEnd={markerEnd || defaultMarkerEnd}
      edgeColor={crossChainColor}
      pathOptions={{
        curvature: 0.4, // More curved for cross-chain connections to emphasize the distance
      }}
      edgeClassName="cross-chain-edge"
    />
  );
};

export default memo(CrossChainEdge);
