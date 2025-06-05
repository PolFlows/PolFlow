import React, { useState, useEffect, memo } from 'react';
import { NodeProps, Position } from 'reactflow';
import { FaBell, FaTelegram, FaDiscord, FaEnvelope, FaSms, FaCheck, FaTimes } from 'react-icons/fa';
import BaseNode, { BaseNodeData } from './BaseNode';
import { useTheme } from '@/contexts/ThemeContext';
import { usePolkadot } from '@/contexts/PolkadotContext';
import { useWallet } from '@/contexts/WalletContext';

// Alert node specific data
interface AlertNodeData extends BaseNodeData {
  alertType: string;
  threshold: string;
  message: string;
  enabled: boolean;
  webhookUrl?: string;
  emailAddress?: string;
  phoneNumber?: string;
  telegramChatId?: string;
  discordWebhookId?: string;
  frequency?: string;
  lastTriggered?: string;
  triggerCount?: number;
}

// Alert node component
const AlertNode: React.FC<NodeProps<AlertNodeData>> = ({ id, data, selected }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { api, activeChain } = usePolkadot();
  const { isConnected } = useWallet();
  
  // State for the node's properties
  const [alertType, setAlertType] = useState<string>(data.alertType || 'Telegram');
  const [threshold, setThreshold] = useState<string>(data.threshold || '5');
  const [message, setMessage] = useState<string>(data.message || 'Alert triggered');
  const [enabled, setEnabled] = useState<boolean>(data.enabled || true);
  const [webhookUrl, setWebhookUrl] = useState<string>(data.webhookUrl || '');
  const [emailAddress, setEmailAddress] = useState<string>(data.emailAddress || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(data.phoneNumber || '');
  const [telegramChatId, setTelegramChatId] = useState<string>(data.telegramChatId || '');
  const [discordWebhookId, setDiscordWebhookId] = useState<string>(data.discordWebhookId || '');
  const [frequency, setFrequency] = useState<string>(data.frequency || 'immediate');
  const [triggerCount, setTriggerCount] = useState<number>(data.triggerCount || 0);
  const [lastTriggered, setLastTriggered] = useState<string>(data.lastTriggered || '');
  
  const [testStatus, setTestStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Available alert types
  const alertTypes = [
    { value: 'Telegram', label: 'Telegram', icon: <FaTelegram /> },
    { value: 'Discord', label: 'Discord', icon: <FaDiscord /> },
    { value: 'Email', label: 'Email', icon: <FaEnvelope /> },
    { value: 'SMS', label: 'SMS', icon: <FaSms /> },
    { value: 'Webhook', label: 'Custom Webhook', icon: <FaBell /> },
  ];

  // Available frequencies
  const frequencies = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'hourly', label: 'Max Once Per Hour' },
    { value: 'daily', label: 'Max Once Per Day' },
    { value: 'always', label: 'Every Occurrence' },
  ];

  // Update node data when properties change
  useEffect(() => {
    data.alertType = alertType;
    data.threshold = threshold;
    data.message = message;
    data.enabled = enabled;
    data.webhookUrl = webhookUrl;
    data.emailAddress = emailAddress;
    data.phoneNumber = phoneNumber;
    data.telegramChatId = telegramChatId;
    data.discordWebhookId = discordWebhookId;
    data.frequency = frequency;
    data.lastTriggered = lastTriggered;
    data.triggerCount = triggerCount;
  }, [
    data, 
    alertType, 
    threshold, 
    message, 
    enabled, 
    webhookUrl, 
    emailAddress, 
    phoneNumber, 
    telegramChatId, 
    discordWebhookId, 
    frequency,
    lastTriggered,
    triggerCount
  ]);

  // Handle alert type change
  const handleAlertTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAlertType(e.target.value);
  };

  // Handle threshold change
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThreshold(e.target.value);
  };

  // Handle message change
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // Handle enabled toggle
  const handleEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnabled(e.target.checked);
  };

  // Handle webhook URL change
  const handleWebhookUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebhookUrl(e.target.value);
  };

  // Handle email address change
  const handleEmailAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailAddress(e.target.value);
  };

  // Handle phone number change
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  // Handle Telegram chat ID change
  const handleTelegramChatIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelegramChatId(e.target.value);
  };

  // Handle Discord webhook ID change
  const handleDiscordWebhookIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiscordWebhookId(e.target.value);
  };

  // Handle frequency change
  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFrequency(e.target.value);
  };

  // Test alert notification
  const handleTestAlert = async () => {
    if (!isConnected) {
      setTestStatus('Not connected');
      return;
    }
    
    setIsLoading(true);
    setTestStatus('Sending test alert...');
    
    try {
      // This is a simplified implementation
      // In a real app, you would send an actual test notification
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Validate required fields based on alert type
      if (alertType === 'Telegram' && !telegramChatId) {
        throw new Error('Telegram Chat ID is required');
      } else if (alertType === 'Discord' && !discordWebhookId) {
        throw new Error('Discord Webhook ID is required');
      } else if (alertType === 'Email' && !emailAddress) {
        throw new Error('Email Address is required');
      } else if (alertType === 'SMS' && !phoneNumber) {
        throw new Error('Phone Number is required');
      } else if (alertType === 'Webhook' && !webhookUrl) {
        throw new Error('Webhook URL is required');
      }
      
      // Simulate successful test
      setTestStatus(`Test alert sent to ${alertType} successfully`);
      
      // Update last triggered time for visual feedback
      const now = new Date().toISOString();
      setLastTriggered(now);
      
      // Increment trigger count
      setTriggerCount(prev => prev + 1);
    } catch (error) {
      console.error('Test alert error:', error);
      setTestStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Format the last triggered time
  const formatLastTriggered = (): string => {
    if (!lastTriggered) return 'Never';
    
    try {
      const date = new Date(lastTriggered);
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get the appropriate input field based on alert type
  const renderAlertTypeInput = () => {
    switch (alertType) {
      case 'Telegram':
        return (
          <div className="space-y-1">
            <label className="text-sm font-medium block">Telegram Chat ID</label>
            <input
              type="text"
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={telegramChatId}
              onChange={handleTelegramChatIdChange}
              placeholder="e.g., 123456789"
              disabled={isLoading}
            />
          </div>
        );
      case 'Discord':
        return (
          <div className="space-y-1">
            <label className="text-sm font-medium block">Discord Webhook ID</label>
            <input
              type="text"
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={discordWebhookId}
              onChange={handleDiscordWebhookIdChange}
              placeholder="e.g., 123456789012345678/AbCdEfGhIjKlMnOpQrStUvWx"
              disabled={isLoading}
            />
          </div>
        );
      case 'Email':
        return (
          <div className="space-y-1">
            <label className="text-sm font-medium block">Email Address</label>
            <input
              type="email"
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={emailAddress}
              onChange={handleEmailAddressChange}
              placeholder="e.g., user@example.com"
              disabled={isLoading}
            />
          </div>
        );
      case 'SMS':
        return (
          <div className="space-y-1">
            <label className="text-sm font-medium block">Phone Number</label>
            <input
              type="tel"
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="e.g., +1234567890"
              disabled={isLoading}
            />
          </div>
        );
      case 'Webhook':
        return (
          <div className="space-y-1">
            <label className="text-sm font-medium block">Webhook URL</label>
            <input
              type="url"
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={webhookUrl}
              onChange={handleWebhookUrlChange}
              placeholder="e.g., https://example.com/webhook"
              disabled={isLoading}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <BaseNode
      id={id}
      data={data}
      selected={selected}
      nodeColor="#ef4444" // Red for alert nodes
      icon={<FaBell />}
      inputHandles={[{ id: 'input', position: Position.Left }]}
      outputHandles={[]}
    >
      <div className="space-y-3">
        {/* Alert type selector */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Alert Channel</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={alertType}
            onChange={handleAlertTypeChange}
            disabled={isLoading}
          >
            {alertTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Alert type specific input */}
        {renderAlertTypeInput()}

        {/* Threshold input */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Threshold (%)</label>
          <div className="flex items-center">
            <input
              type="number"
              className={`w-full p-2 rounded-md ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              } border text-sm`}
              value={threshold}
              onChange={handleThresholdChange}
              placeholder="5"
              min="0"
              max="100"
              disabled={isLoading}
            />
            <span className="ml-2">%</span>
          </div>
          <div className="text-xs text-gray-500">
            Trigger alert when price moves by this percentage
          </div>
        </div>

        {/* Alert message */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Alert Message</label>
          <textarea
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={message}
            onChange={handleMessageChange}
            placeholder="Enter alert message..."
            rows={2}
            disabled={isLoading}
          />
          <div className="text-xs text-gray-500">
            Use {'{asset}'}, {'{price}'}, {'{change}'} as placeholders
          </div>
        </div>

        {/* Alert frequency */}
        <div className="space-y-1">
          <label className="text-sm font-medium block">Alert Frequency</label>
          <select
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            } border text-sm`}
            value={frequency}
            onChange={handleFrequencyChange}
            disabled={isLoading}
          >
            {frequencies.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {freq.label}
              </option>
            ))}
          </select>
        </div>

        {/* Enable/disable toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`${id}-enabled`}
            checked={enabled}
            onChange={handleEnabledChange}
            className="mr-2"
            disabled={isLoading}
          />
          <label htmlFor={`${id}-enabled`} className="text-sm font-medium">
            Enable Alert
          </label>
        </div>

        {/* Alert status */}
        <div className={`p-3 rounded-md ${
          isDark ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <span className={`flex items-center text-sm ${
              enabled ? 'text-green-500' : 'text-red-500'
            }`}>
              {enabled ? (
                <>
                  <FaCheck className="mr-1" /> Active
                </>
              ) : (
                <>
                  <FaTimes className="mr-1" /> Inactive
                </>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">Last triggered:</span>
            <span className="text-xs">{formatLastTriggered()}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">Trigger count:</span>
            <span className="text-xs">{triggerCount}</span>
          </div>
        </div>

        {/* Test button */}
        <button
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            !isConnected || isLoading
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors duration-200`}
          onClick={handleTestAlert}
          disabled={!isConnected || isLoading}
        >
          {isLoading ? 'Testing...' : 'Test Alert'}
        </button>

        {/* Test status */}
        {testStatus && (
          <div className={`text-xs ${
            testStatus.startsWith('Test alert sent')
              ? 'text-green-500'
              : testStatus.startsWith('Error') || testStatus.startsWith('Not')
              ? 'text-red-500'
              : isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {testStatus}
          </div>
        )}

        {/* Not connected warning */}
        {!isConnected && (
          <div className="text-xs text-amber-500">
            Connect a wallet to test alerts
          </div>
        )}
      </div>
    </BaseNode>
  );
};

export default memo(AlertNode);
