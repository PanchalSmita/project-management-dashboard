// Utility functions for error handling and state management

import { ActionResult } from '../types/hooks';

/**
 * Creates a standardized success result
 */
export function createSuccessResult<T>(data?: T): ActionResult<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Creates a standardized error result
 */
export function createErrorResult<T>(error: string): ActionResult<T> {
  return {
    success: false,
    error,
  };
}

/**
 * Wraps async operations with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<ActionResult<T>> {
  try {
    const result = await operation();
    return createSuccessResult(result);
  } catch (error) {
    const message = errorMessage || 
      (error instanceof Error ? error.message : 'An unexpected error occurred');
    console.error('Hook operation failed:', error);
    return createErrorResult(message);
  }
}

/**
 * Debounce function for search and input operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Generates unique IDs for entities
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formats date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats date with time for display
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculates relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(d);
}

/**
 * Safely parses JSON from localStorage
 */
export function safeParseJSON<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Safely stringifies data for localStorage
 */
export function safeStringifyJSON(data: any): string {
  try {
    return JSON.stringify(data);
  } catch {
    return '{}';
  }
}

/**
 * Storage utilities with error handling
 */
export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Session storage utilities
 */
export const sessionStorage = {
  get<T>(key: string, fallback: T): T {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key: string, value: any): boolean {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key: string): boolean {
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Priority level utilities
 */
export const priorityUtils = {
  getColor: (priority: 'Low' | 'Medium' | 'High'): string => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-900/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'Low': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  },

  getOrder: (priority: 'Low' | 'Medium' | 'High'): number => {
    switch (priority) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 0;
    }
  }
};

/**
 * Array utilities for reordering
 */
export function reorderArray<T>(
  array: T[],
  startIndex: number,
  endIndex: number
): T[] {
  const result = Array.from(array);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

/**
 * Validation utilities
 */
export const validators = {
  required: (value: any): boolean => {
    return value !== null && value !== undefined && value !== '';
  },

  minLength: (value: string, min: number): boolean => {
    return typeof value === 'string' && value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return typeof value === 'string' && value.length <= max;
  },

  email: (value: string): boolean => {
    return isValidEmail(value);
  }
};

/**
 * Creates a delay for async operations (useful for testing)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}