import React, { memo } from 'react';
import { EdgeProps, MarkerType } from 'reactflow';
import BaseEdge, { BaseEdgeData } from './BaseEdge';

// Asset flow edge data interface
interface AssetFlowEdgeData extends BaseEdgeData {
  // Add any asset flow specific properties here
  tokenSymbol?: string;
  tokenAmount?: string;
  tokenIcon?: string;
}

// Asset flow edge component for connecting asset transfer nodes
const AssetFlowEdge: React.FC<EdgeProps<AssetFlowEdgeData>> = ({
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
  // Asset flow edges use green color
  const assetFlowColor = '#10b981'; // Tailwind green-500
  
  // Default asset flow style with animation
  const assetFlowStyle = {
    stroke: assetFlowColor,
    strokeWidth: 2,
    ...style,
  };

  // Default marker for asset flow
  const defaultMarkerEnd = {
    type: MarkerType.ArrowClosed,
    color: assetFlowColor,
    width: 20,
    height: 20,
  };

  // Generate label with token information if available
  const edgeLabel = data?.tokenAmount && data?.tokenSymbol 
    ? `${data.tokenAmount} ${data.tokenSymbol}`
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
        animated: true, // Asset flow edges are animated by default
        labelShowBg: true,
        labelBgStyle: {
          fill: '#10b981',
          color: 'white',
          fillOpacity: 0.7,
        },
      }}
      style={assetFlowStyle}
      selected={selected}
      markerEnd={markerEnd || defaultMarkerEnd}
      edgeColor={assetFlowColor}
      pathOptions={{
        curvature: 0.25, // Standard curve for asset transfers
      }}
      edgeClassName="asset-flow-edge"
    />
  );
};

export default memo(AssetFlowEdge);
