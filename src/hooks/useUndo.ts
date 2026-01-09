import { useState, useCallback, useRef } from "react";
import { useNotifications } from "./useNotifications";

export interface UndoAction {
  id: string;
  type: string;
  description: string;
  undo: () => Promise<void> | void;
  redo: () => Promise<void> | void;
  timestamp: number;
}

export interface UndoOptions {
  maxHistorySize?: number;
  autoExpireMs?: number;
}

const DEFAULT_OPTIONS: UndoOptions = {
  maxHistorySize: 50,
  autoExpireMs: 30000, // 30 seconds
};

export const useUndo = (options: UndoOptions = {}) => {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoAction[]>([]);
  const [isUndoing, setIsUndoing] = useState(false);
  const [isRedoing, setIsRedoing] = useState(false);
  const timeoutRefs = useRef<Map<string, number>>(new Map());
  
  const config = { ...DEFAULT_OPTIONS, ...options };
  const { success, error } = useNotifications();

  const clearExpiredActions = useCallback(() => {
    const now = Date.now();
    setUndoStack(prev => prev.filter(action => 
      now - action.timestamp < (config.autoExpireMs || Infinity)
    ));
    setRedoStack(prev => prev.filter(action => 
      now - action.timestamp < (config.autoExpireMs || Infinity)
    ));
  }, [config.autoExpireMs]);

  const addAction = useCallback((action: Omit<UndoAction, "id" | "timestamp">) => {
    const newAction: UndoAction = {
      ...action,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };

    setUndoStack(prev => {
      const newStack = [newAction, ...prev];
      
      // Limit stack size
      if (config.maxHistorySize && newStack.length > config.maxHistorySize) {
        return newStack.slice(0, config.maxHistorySize);
      }
      
      return newStack;
    });

    // Clear redo stack when new action is added
    setRedoStack([]);

    // Set up auto-expiration
    if (config.autoExpireMs) {
      const timeoutId = setTimeout(() => {
        clearExpiredActions();
        timeoutRefs.current.delete(newAction.id);
      }, config.autoExpireMs);
      
      timeoutRefs.current.set(newAction.id, timeoutId);
    }

    return newAction.id;
  }, [config.maxHistorySize, config.autoExpireMs, clearExpiredActions]);

  const undo = useCallback(async () => {
    if (undoStack.length === 0 || isUndoing || isRedoing) return false;

    const action = undoStack[0];
    setIsUndoing(true);

    try {
      await action.undo();
      
      setUndoStack(prev => prev.slice(1));
      setRedoStack(prev => [action, ...prev]);
      
      success(`Undid: ${action.description}`);
      return true;
    } catch (err) {
      error(`Failed to undo: ${action.description}`);
      return false;
    } finally {
      setIsUndoing(false);
    }
  }, [undoStack, isUndoing, isRedoing, success, error]);

  const redo = useCallback(async () => {
    if (redoStack.length === 0 || isUndoing || isRedoing) return false;

    const action = redoStack[0];
    setIsRedoing(true);

    try {
      await action.redo();
      
      setRedoStack(prev => prev.slice(1));
      setUndoStack(prev => [action, ...prev]);
      
      success(`Redid: ${action.description}`);
      return true;
    } catch (err) {
      error(`Failed to redo: ${action.description}`);
      return false;
    } finally {
      setIsRedoing(false);
    }
  }, [redoStack, isUndoing, isRedoing, success, error]);

  const clear = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
    
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
  }, []);

  const canUndo = undoStack.length > 0 && !isUndoing && !isRedoing;
  const canRedo = redoStack.length > 0 && !isUndoing && !isRedoing;

  const getLastAction = useCallback(() => {
    return undoStack[0] || null;
  }, [undoStack]);

  const getNextRedoAction = useCallback(() => {
    return redoStack[0] || null;
  }, [redoStack]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "z") {
      event.preventDefault();
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
    }
  }, [undo, redo]);

  return {
    // State
    undoStack,
    redoStack,
    isUndoing,
    isRedoing,
    canUndo,
    canRedo,

    // Actions
    addAction,
    undo,
    redo,
    clear,

    // Utilities
    getLastAction,
    getNextRedoAction,
    handleKeyDown,
    
    // Stats
    undoCount: undoStack.length,
    redoCount: redoStack.length,
  };
};

// Specialized undo hooks for common operations
export const useTaskUndo = () => {
  const undo = useUndo();
  
  const addTaskAction = useCallback((
    type: "create" | "update" | "delete" | "move",
    taskData: any,
    undoFn: () => void,
    redoFn: () => void
  ) => {
    const descriptions = {
      create: `Create task "${taskData.title}"`,
      update: `Update task "${taskData.title}"`,
      delete: `Delete task "${taskData.title}"`,
      move: `Move task "${taskData.title}"`,
    };

    return undo.addAction({
      type: `task.${type}`,
      description: descriptions[type],
      undo: undoFn,
      redo: redoFn,
    });
  }, [undo]);

  return {
    ...undo,
    addTaskAction,
  };
};

export const useProjectUndo = () => {
  const undo = useUndo();
  
  const addProjectAction = useCallback((
    type: "create" | "update" | "delete",
    projectData: any,
    undoFn: () => void,
    redoFn: () => void
  ) => {
    const descriptions = {
      create: `Create project "${projectData.name}"`,
      update: `Update project "${projectData.name}"`,
      delete: `Delete project "${projectData.name}"`,
    };

    return undo.addAction({
      type: `project.${type}`,
      description: descriptions[type],
      undo: undoFn,
      redo: redoFn,
    });
  }, [undo]);

  return {
    ...undo,
    addProjectAction,
  };
};