import React, { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { useTheme } from '@/contexts/ThemeContext';

// Base edge data interface that all edges will extend
export interface BaseEdgeData {
  label?: string;
  animated?: boolean;
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  labelBgStyle?: React.CSSProperties;
  labelBgPadding?: [number, number];
  labelBgBorderRadius?: number;
  labelShowBg?: boolean;
  labelBgClassName?: string;
  labelClassName?: string;
  interactionWidth?: number;
}

// Props for the BaseEdge component
export interface BaseEdgeProps extends EdgeProps<BaseEdgeData> {
  pathOptions?: {
    curvature?: number;
    offset?: number;
    borderRadius?: number;
  };
  markerOptions?: {
    markerStart?: React.ReactNode;
    markerEnd?: React.ReactNode;
  };
  edgeColor?: string;
  edgeClassName?: string;
  pathClassName?: string;
}

// Base edge component that all other edges will extend
const BaseEdge: React.FC<BaseEdgeProps> = ({
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
  markerStart,
  pathOptions = {},
  markerOptions = {},
  edgeColor = '#b1b1b7',
  edgeClassName = '',
  pathClassName = '',
  selected,
  interactionWidth = 20,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Default path options
  const { curvature = 0.25, offset = 0, borderRadius = 0 } = pathOptions;
  
  // Get the path for the edge
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature,
  });

  // Combine styles
  const edgeStyles: React.CSSProperties = {
    stroke: edgeColor,
    strokeWidth: selected ? 3 : 2,
    ...style,
    ...(data?.style || {}),
  };

  // Label styles
  const labelBgStyles: React.CSSProperties = {
    fill: isDark ? '#374151' : '#f3f4f6',
    color: isDark ? '#e5e7eb' : '#374151',
    ...(data?.labelBgStyle || {}),
  };

  const labelStyles: React.CSSProperties = {
    fontFamily: 'sans-serif',
    fontSize: 12,
    ...(data?.labelStyle || {}),
  };

  return (
    <>
      {/* Edge path */}
      <path
        id={id}
        className={`react-flow__edge-path ${pathClassName} ${data?.animated ? 'animated' : ''}`}
        d={edgePath}
        style={edgeStyles}
        markerEnd={markerEnd || markerOptions.markerEnd}
        markerStart={markerStart || markerOptions.markerStart}
      />
      
      {/* Invisible wider path for better interaction */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={interactionWidth || data?.interactionWidth || 20}
        stroke="transparent"
        strokeLinecap="round"
        className={`react-flow__edge-interaction ${edgeClassName}`}
      />
      
      {/* Edge label */}
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              backgroundColor: data.labelShowBg !== false ? (isDark ? '#374151' : '#f3f4f6') : 'transparent',
              padding: '4px 8px',
              borderRadius: data.labelBgBorderRadius || 4,
              fontSize: 12,
              fontWeight: 500,
              ...labelBgStyles,
            }}
            className={`nodrag nopan ${data.labelBgClassName || ''}`}
          >
            <div style={labelStyles} className={data.labelClassName || ''}>
              {data.label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default memo(BaseEdge);
