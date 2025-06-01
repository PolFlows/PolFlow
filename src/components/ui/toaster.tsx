'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

// Toast types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast positions
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

// Toast interface
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // Duration in milliseconds
  position?: ToastPosition;
}

// Toast context interface
interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

// Create toast context
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Toast provider props
interface ToastProviderProps {
  children: ReactNode;
  defaultPosition?: ToastPosition;
  defaultDuration?: number;
}

// Toast provider component
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultPosition = 'top-right',
  defaultDuration = 5000, // 5 seconds
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add a new toast
  const addToast = useCallback(
    ({ type, message, duration = defaultDuration, position = defaultPosition }: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = {
        id,
        type,
        message,
        duration,
        position,
      };

      setToasts((prevToasts) => [...prevToasts, newToast]);

      // Auto-remove toast after duration
      if (duration !== Infinity) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [defaultDuration, defaultPosition]
  );

  // Remove a toast by ID
  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  );
};

// Custom hook to use toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast component
const Toast: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Get icon based on toast type
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500" />;
      case 'info':
        return <FaInfoCircle className="text-blue-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      default:
        return null;
    }
  };

  // Get background color based on toast type and theme
  const getBackgroundColor = () => {
    if (isDark) {
      switch (toast.type) {
        case 'success':
          return 'bg-green-900';
        case 'error':
          return 'bg-red-900';
        case 'info':
          return 'bg-blue-900';
        case 'warning':
          return 'bg-yellow-900';
        default:
          return 'bg-gray-800';
      }
    } else {
      switch (toast.type) {
        case 'success':
          return 'bg-green-100';
        case 'error':
          return 'bg-red-100';
        case 'info':
          return 'bg-blue-100';
        case 'warning':
          return 'bg-yellow-100';
        default:
          return 'bg-gray-100';
      }
    }
  };

  return (
    <div
      className={`flex items-center p-4 mb-3 rounded-md shadow-md ${getBackgroundColor()} ${
        isDark ? 'text-white' : 'text-gray-800'
      } transition-all duration-300 ease-in-out transform hover:scale-105`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex-shrink-0 mr-3">{getIcon()}</div>
      <div className="flex-1">{toast.message}</div>
      <button
        onClick={onClose}
        className={`ml-3 p-1 rounded-full ${
          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-300'
        } transition-colors duration-200`}
        aria-label="Close"
      >
        <FaTimes />
      </button>
    </div>
  );
};

// Get position classes for toast container
const getPositionClasses = (position: ToastPosition): string => {
  switch (position) {
    case 'top-right':
      return 'top-4 right-4';
    case 'top-left':
      return 'top-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'top-center':
      return 'top-4 left-1/2 transform -translate-x-1/2';
    case 'bottom-center':
      return 'bottom-4 left-1/2 transform -translate-x-1/2';
    default:
      return 'top-4 right-4';
  }
};

// Toaster component that displays all toasts
export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToast();

  // Group toasts by position
  const toastsByPosition = toasts.reduce<Record<ToastPosition, Toast[]>>(
    (acc, toast) => {
      const position = toast.position || 'top-right';
      if (!acc[position]) {
        acc[position] = [];
      }
      acc[position].push(toast);
      return acc;
    },
    {} as Record<ToastPosition, Toast[]>
  );

  return (
    <>
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <div
          key={position}
          className={`fixed z-50 w-72 max-w-full ${getPositionClasses(position as ToastPosition)}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {positionToasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </div>
      ))}
    </>
  );
};

// Default export for the Toaster component
export default Toaster;
