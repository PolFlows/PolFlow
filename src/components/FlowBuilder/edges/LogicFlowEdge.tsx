import React, { memo } from 'react';
import { EdgeProps, MarkerType } from 'reactflow';
import BaseEdge, { BaseEdgeData } from './BaseEdge';

// Logic flow edge data interface
interface LogicFlowEdgeData extends BaseEdgeData {
  // Add any logic flow specific properties here
  condition?: string;
  conditionType?: 'if' | 'while' | 'delay' | 'cron';
  isTrue?: boolean; // Whether this edge represents the "true" path
}

// Logic flow edge component for connecting conditional nodes
const LogicFlowEdge: React.FC<EdgeProps<LogicFlowEdgeData>> = ({
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
  // Logic flow edges use orange color
  const logicFlowColor = '#f97316'; // Tailwind orange-500
  
  // Default logic flow style with animation
  const logicFlowStyle = {
    stroke: logicFlowColor,
    strokeWidth: 2,
    ...style,
  };

  // Default marker for logic flow
  const defaultMarkerEnd = {
    type: MarkerType.ArrowClosed,
    color: logicFlowColor,
    width: 20,
    height: 20,
  };

  // Generate label with condition information if available
  const edgeLabel = data?.condition 
    ? `${data.conditionType || 'if'}: ${data.condition}`
    : data?.isTrue !== undefined
      ? data.isTrue ? 'True' : 'False'
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
        animated: true, // Logic flow edges are animated by default
        labelShowBg: true,
        labelBgStyle: {
          fill: '#f97316',
          color: 'white',
          fillOpacity: 0.7,
        },
      }}
      style={logicFlowStyle}
      selected={selected}
      markerEnd={markerEnd || defaultMarkerEnd}
      edgeColor={logicFlowColor}
      pathOptions={{
        curvature: 0.3, // More curved for logic connections to distinguish them
      }}
      edgeClassName="logic-flow-edge"
    />
  );
};

export default memo(LogicFlowEdge);
