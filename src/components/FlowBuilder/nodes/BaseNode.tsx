import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useTheme } from '@/contexts/ThemeContext';

// Base node data interface that all nodes will extend
export interface BaseNodeData {
  label: string;
  description?: string;
  [key: string]: any;
}

// Props for the BaseNode component
export interface BaseNodeProps extends NodeProps<BaseNodeData> {
  children?: React.ReactNode;
  inputHandles?: Array<{
    id: string;
    position?: Position;
    type?: string;
    label?: string;
  }>;
  outputHandles?: Array<{
    id: string;
    position?: Position;
    type?: string;
    label?: string;
  }>;
  showHandles?: boolean;
  nodeColor?: string;
  icon?: React.ReactNode;
}

// Base node component that all other nodes will extend
const BaseNode: React.FC<BaseNodeProps> = ({
  id,
  data,
  selected,
  children,
  inputHandles = [{ id: 'input' }],
  outputHandles = [{ id: 'output' }],
  showHandles = true,
  nodeColor = '#3b82f6', // Default blue color
  icon,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`relative rounded-lg border ${
        selected 
          ? 'border-blue-500 shadow-lg' 
          : isDark 
            ? 'border-gray-700' 
            : 'border-gray-300'
      } overflow-hidden transition-all duration-200 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}
      style={{ minWidth: '220px', maxWidth: '280px' }}
    >
      {/* Node header */}
      <div 
        className="px-3 py-2 flex items-center gap-2 border-b"
        style={{ 
          backgroundColor: selected ? nodeColor : isDark ? '#374151' : '#f3f4f6',
          borderColor: isDark ? '#4b5563' : '#e5e7eb',
        }}
      >
        {icon && <span className="text-lg">{icon}</span>}
        <div className={`font-medium truncate ${selected ? 'text-white' : ''}`}>
          {data.label}
        </div>
      </div>

      {/* Node content */}
      <div className="p-3">
        {children}
      </div>

      {/* Input handles */}
      {showHandles && inputHandles.map((handle) => (
        <Handle
          key={`input-${handle.id}`}
          id={handle.id}
          type="target"
          position={handle.position || Position.Left}
          className="w-3 h-3 border-2 bg-white border-gray-400"
          style={{ zIndex: 10 }}
        />
      ))}

      {/* Output handles */}
      {showHandles && outputHandles.map((handle) => (
        <Handle
          key={`output-${handle.id}`}
          id={handle.id}
          type="source"
          position={handle.position || Position.Right}
          className="w-3 h-3 border-2 bg-white border-gray-400"
          style={{ zIndex: 10 }}
        />
      ))}
    </div>
  );
};

export default memo(BaseNode);
