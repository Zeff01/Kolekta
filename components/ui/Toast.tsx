'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({ id, message, type, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-700';
      case 'error':
        return 'bg-retro-red border-red-700';
      case 'warning':
        return 'bg-retro-yellow border-yellow-700 text-retro-black';
      case 'info':
        return 'bg-retro-blue border-blue-700';
      default:
        return 'bg-retro-black border-retro-gray';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div
      className={`
        ${getTypeStyles()}
        text-retro-white
        px-4 py-3
        border-2
        shadow-pixel
        font-pixel text-xs
        flex items-center gap-3
        animate-slide-in-right
        min-w-[280px]
        max-w-md
      `}
      role="alert"
    >
      <span className="text-base font-bold">{getIcon()}</span>
      <p className="flex-1">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-base hover:opacity-70 transition-opacity"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}
