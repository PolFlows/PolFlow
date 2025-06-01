import React, { useState, memo } from 'react';
import { NodeProps, Position } from 'reactflow';
import { FaRandom } from 'react-icons/fa';
import BaseNode, { BaseNodeData } from './BaseNode';
import { useTheme } from '@/contexts/ThemeContext';
import { usePolkadot } from '@/contexts/PolkadotContext';
import { useFlow } from '@/contexts/FlowContext';

// Conditional node specific data
interface ConditionalNodeData extends BaseNodeData {
  condition: string;
  value: string;
  timeDelay: string;
  logicType: string;
  referenceNodeId?: string;
  referenceProperty?: string;
}

// Conditional node component
const ConditionalNode: React.FC<NodeProps<ConditionalNodeData>> = ({ id, data, selected }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { nodes } = useFlow();
  const { api } = usePolkadot();
  
  // State for the node's properties
  const [condition, setCondition] = useState<string>(data.condition || 'greater_than');
  const [value, setValue] = useState<string>(data.value || '0');
  const [timeDelay, setTimeDelay] = useState<string>(data.timeDelay || '0');
  const [logicType, setLogicType] = useState<string>(data.logicType || 'if');
  const [referenceNodeId, setReferenceNodeId] = useState<string>(data.referenceNodeId || '');
  const [referenceProperty, setReferenceProperty] = useState<string>(data.referenceProperty || '');

  // Available condition types
  const conditionTypes = [
    { value: 'greater_than', label: 'Greater Than (>)' },
    { value: 'less_than', label: 'Less Than (<)' },
    { value: 'equals', label: 'Equals (=)' },
    { value: 'not_equals', label: 'Not Equals (≠)' },
    { value: 'greater_equals', label: 'Greater Than or Equal (≥)' },
    { value: 'less_equals', label: 'Less Than or Equal (≤)' },
    { value: 'contains', label: 'Contains' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
  ];

  // Available logic types
  const logicTypes = [
    { value: 'if', label: 'If (Once)' },
    { value: 'while', label: 'While (Repeat)' },
    { value: 'delay', label: 'Delay (Wait)' },
    { value: 'cron', label: 'Schedule (Cron)' },
  ];

  // Get all potential reference nodes (excluding this node and non-data nodes)
  const referenceNodes = nodes.filter(node => 
    node.id !== id && 
    (node.type === 'assetSelector' || node.type === 'oracleFeed' || node.type === 'dexAggregator')
  );

  // Get properties that can be referenced from the selected node
  const getReferenceProperties = () => {
    if (!referenceNodeId) return [];
    
    const node = nodes.find(n => n.id === referenceNodeId);
    if (!node || !node.data) return [];
    
    // Extract properties based on node type
    switch (node.type) {
      case 'assetSelector':
        return [
          { value: 'amount', label: 'Amount' },
          { value: 'balance', label: 'Balance' },
        ];
      case 'oracleFeed':
        return [
          { value: 'price', label: 'Price' },
          { value: 'volume', label: 'Volume' },
          { value: 'marketCap', label: 'Market Cap' },
        ];
      case 'dexAggregator':
        return [
          { value: 'price', label: 'Price' },
          { value: 'slippage', label: 'Slippage' },
          { value: 'liquidity', label: 'Liquidity' },
        ];
      default:
        return [];
    }
  };

  // Handle condition type change
  const handleConditionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCondition(e.target.value);
    data.condition = e.target.value;
  };

  // Handle value change
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    data.value = e.target.value;
  };

  // Handle time delay change
  const handleTimeDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeDelay(e.target.value);
    data.timeDelay = e.target.value;
  };

  // Handle logic type change
  const handleLogicTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLogicType(e.target.value);
    data.logicType = e.target.value;
  };

  // Handle reference node change
  const handleReferenceNodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReferenceNodeId(e.target.value);
    data.referenceNodeId = e.target.value;
    
    // Reset reference property when node changes
    setReferenceProperty('');
    data.referenceProperty = '';
  };

  // Handle reference property change
  const handleReferencePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReferenceProperty(e.target.value);
    data.referenceProperty = e.target.value;
  };

  // Format the condition as a human-readable string
  const getConditionString = () => {
    if (logicType === 'delay') {
      return `Wait for ${timeDelay} seconds`;
    }
    
    if (logicType === 'cron') {
      return `Schedule: ${value}`;
    }
    
    let conditionLabel = conditionTypes.find(c => c.value === condition)?.label.split(' ')[0] || condition;
    let referenceLabel = 'Value';
    
    if (referenceNodeId && referenceProperty) {
      const refNode = nodes.find(n => n.id === referenceNodeId);
      if (refNode) {
        const nodeLabel = refNode.data.label || refNode.type;
        const propLabel = getReferenceProperties().find(p => p.value === referenceProperty)?.label || referenceProperty;
        referenceLabel = `${nodeLabel}'s ${propLabel}`;
      }
    }
    
    return `${logicType.toUpperCase()} ${referenceLabel} ${conditionLabel} ${value}`;
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      nodeColor="#f97316" // Orange for conditional nodes
      icon={<FaRandom />}
      inputHandles={[{ id: 'input', position: Position.Left }]}
      outputHandles={[
        { id: 'true', position: Position.Right, label: 'True' },
        { id: 'false', position: Position.Bottom, label: 'False' }
      ]}
    >
      <div className="space-y-3">
        {/* Logic type selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Logic Type</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={logicType}
            onChange={handleLogicTypeChange}
          >
            {logicTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reference node selector (only for if/while) */}
        {(logicType === 'if' || logicType === 'while') && (
          <div className="space-y-1">
            <label className="text-sm font-medium block">Reference Node</label>
            <select
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={referenceNodeId}
              onChange={handleReferenceNodeChange}
            >
              <option value="">Select a node</option>
              {referenceNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.data.label || node.type}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reference property selector (only if a reference node is selected) */}
        {referenceNodeId && (logicType === 'if' || logicType === 'while') && (
          <div className="space-y-1">
            <label className="text-sm font-medium block">Reference Property</label>
            <select
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={referenceProperty}
              onChange={handleReferencePropertyChange}
            >
              <option value="">Select a property</option>
              {getReferenceProperties().map((prop) => (
                <option key={prop.value} value={prop.value}>
                  {prop.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Condition selector (only for if/while) */}
        {(logicType === 'if' || logicType === 'while') && (
          <div className="space-y-1">
            <label className="text-sm font-medium block">Condition</label>
            <select
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={condition}
              onChange={handleConditionChange}
            >
              {conditionTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Value input (for if/while/cron) */}
        {(logicType === 'if' || logicType === 'while' || logicType === 'cron') && (
          <div className="space-y-1">
            <label className="text-sm font-medium block">
              {logicType === 'cron' ? 'Cron Expression' : 'Value'}
            </label>
            <input
              type="text"
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={value}
              onChange={handleValueChange}
              placeholder={logicType === 'cron' ? '0 0 * * *' : '0'}
            />
            {logicType === 'cron' && (
              <div className="text-xs text-gray-500 mt-1">
                Format: minute hour day month weekday
              </div>
            )}
          </div>
        )}

        {/* Time delay input (for delay) */}
        {logicType === 'delay' && (
          <div className="space-y-1">
            <label className="text-sm font-medium block">Delay (seconds)</label>
            <input
              type="number"
              min="0"
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={timeDelay}
              onChange={handleTimeDelayChange}
              placeholder="0"
            />
          </div>
        )}

        {/* Condition preview */}
        <div className={`mt-2 p-2 rounded-md text-sm ${
          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>
          {getConditionString()}
        </div>

        {/* Warning for missing references */}
        {(logicType === 'if' || logicType === 'while') && (!referenceNodeId || !referenceProperty) && (
          <div className="text-xs text-amber-500">
            Select a reference node and property to complete the condition
          </div>
        )}

        {/* API connection warning */}
        {!api && (
          <div className="text-xs text-amber-500">
            Connect to a blockchain to enable real-time condition evaluation
          </div>
        )}
      </div>
    </BaseNode>
  );
};

export default memo(ConditionalNode);
