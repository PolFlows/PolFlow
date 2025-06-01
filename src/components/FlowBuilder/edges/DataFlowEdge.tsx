import React, { memo } from 'react';
import { EdgeProps, MarkerType } from 'reactflow';
import BaseEdge, { BaseEdgeData } from './BaseEdge';

// Data flow edge data interface
interface DataFlowEdgeData extends BaseEdgeData {
  // Add any data flow specific properties here
}

// Data flow edge component for connecting data nodes
const DataFlowEdge: React.FC<EdgeProps<DataFlowEdgeData>> = ({
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
  // Data flow edges use blue color
  const dataFlowColor = '#3b82f6'; // Tailwind blue-500
  
  // Default data flow style with animation
  const dataFlowStyle = {
    stroke: dataFlowColor,
    strokeWidth: 2,
    ...style,
  };

  // Default marker for data flow
  const defaultMarkerEnd = {
    type: MarkerType.ArrowClosed,
    color: dataFlowColor,
    width: 20,
    height: 20,
  };

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
        animated: true, // Data flow edges are animated by default
      }}
      style={dataFlowStyle}
      selected={selected}
      markerEnd={markerEnd || defaultMarkerEnd}
      edgeColor={dataFlowColor}
      pathOptions={{
        curvature: 0.2, // Slightly less curved for data connections
      }}
      edgeClassName="data-flow-edge"
    />
  );
};

export default memo(DataFlowEdge);
