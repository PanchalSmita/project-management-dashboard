import { useState, useCallback } from "react";
import { useTasks } from "./useTasks";
import { useNotifications } from "./useNotifications";
import { useTaskUndo } from "./useUndo";
import type { Task, Priority } from "../types";

export interface BulkActionOptions {
  confirmBeforeAction?: boolean;
  showProgress?: boolean;
  batchSize?: number;
}

export interface BulkActionResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}

const DEFAULT_OPTIONS: BulkActionOptions = {
  confirmBeforeAction: true,
  showProgress: true,
  batchSize: 10,
};

export const useBulkActions = (options: BulkActionOptions = {}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  
  const config = { ...DEFAULT_OPTIONS, ...options };
  const { success, error } = useNotifications();
  const { moveTask, deleteTask, assignTask, setPriority, updateTask } = useTasks();
  const { } = useTaskUndo();

  // Selection management
  const selectItem = useCallback((id: string) => {
    setSelectedItems(prev => new Set([...prev, id]));
  }, []);

  const deselectItem = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((items: string[]) => {
    setSelectedItems(new Set(items));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const selectRange = useCallback((items: string[], startIndex: number, endIndex: number) => {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    const rangeItems = items.slice(start, end + 1);
    
    setSelectedItems(prev => new Set([...prev, ...rangeItems]));
  }, []);

  // Bulk operations
  const processBatch = useCallback(async <T>(
    items: T[],
    processor: (item: T) => Promise<{ success: boolean; error?: string }>,
    onProgress?: (current: number, total: number) => void
  ): Promise<BulkActionResult> => {
    const result: BulkActionResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
    };

    const batchSize = config.batchSize || 10;
    const total = items.length;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (item) => {
        try {
          const itemResult = await processor(item);
          if (itemResult.success) {
            result.processed++;
          } else {
            result.failed++;
            if (itemResult.error) {
              result.errors.push(itemResult.error);
            }
          }
        } catch (err) {
          result.failed++;
          result.errors.push(err instanceof Error ? err.message : "Unknown error");
        }
      });

      await Promise.all(batchPromises);
      
      if (onProgress) {
        onProgress(Math.min(i + batchSize, total), total);
      }
    }

    result.success = result.failed === 0;
    return result;
  }, [config.batchSize]);

  const bulkMove = useCallback(async (taskIds: string[], targetBoardId: string) => {
    if (taskIds.length === 0) return { success: false, processed: 0, failed: 0, errors: ["No tasks selected"] };

    setIsProcessing(true);
    setProgress({ current: 0, total: taskIds.length });

    try {
      const result = await processBatch(
        taskIds,
        async (taskId) => {
          const moveResult = await moveTask(taskId, targetBoardId);
          return { success: moveResult.success, error: moveResult.success ? undefined : "Failed to move task" };
        },
        (current, total) => setProgress({ current, total })
      );

      if (result.success) {
        success(`Successfully moved ${result.processed} tasks`);
        deselectAll();
      } else {
        error(`Failed to move ${result.failed} out of ${taskIds.length} tasks`);
      }

      return result;
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [processBatch, moveTask, success, error, deselectAll]);

  const bulkDelete = useCallback(async (taskIds: string[]) => {
    if (taskIds.length === 0) return { success: false, processed: 0, failed: 0, errors: ["No tasks selected"] };

    setIsProcessing(true);
    setProgress({ current: 0, total: taskIds.length });

    try {
      const result = await processBatch(
        taskIds,
        async (taskId) => {
          const deleteResult = await deleteTask(taskId);
          return { success: deleteResult.success, error: deleteResult.success ? undefined : "Failed to delete task" };
        },
        (current, total) => setProgress({ current, total })
      );

      if (result.success) {
        success(`Successfully deleted ${result.processed} tasks`);
        deselectAll();
      } else {
        error(`Failed to delete ${result.failed} out of ${taskIds.length} tasks`);
      }

      return result;
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [processBatch, deleteTask, success, error, deselectAll]);

  const bulkAssign = useCallback(async (taskIds: string[], assigneeId: string) => {
    if (taskIds.length === 0) return { success: false, processed: 0, failed: 0, errors: ["No tasks selected"] };

    setIsProcessing(true);
    setProgress({ current: 0, total: taskIds.length });

    try {
      const result = await processBatch(
        taskIds,
        async (taskId) => {
          const assignResult = await assignTask(taskId, assigneeId);
          return { success: assignResult.success, error: assignResult.success ? undefined : "Failed to assign task" };
        },
        (current, total) => setProgress({ current, total })
      );

      if (result.success) {
        success(`Successfully assigned ${result.processed} tasks`);
        deselectAll();
      } else {
        error(`Failed to assign ${result.failed} out of ${taskIds.length} tasks`);
      }

      return result;
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [processBatch, assignTask, success, error, deselectAll]);

  const bulkSetPriority = useCallback(async (taskIds: string[], priority: Priority) => {
    if (taskIds.length === 0) return { success: false, processed: 0, failed: 0, errors: ["No tasks selected"] };

    setIsProcessing(true);
    setProgress({ current: 0, total: taskIds.length });

    try {
      const result = await processBatch(
        taskIds,
        async (taskId) => {
          const priorityResult = await setPriority(taskId, priority);
          return { success: priorityResult.success, error: priorityResult.success ? undefined : "Failed to set priority" };
        },
        (current, total) => setProgress({ current, total })
      );

      if (result.success) {
        success(`Successfully updated priority for ${result.processed} tasks`);
        deselectAll();
      } else {
        error(`Failed to update priority for ${result.failed} out of ${taskIds.length} tasks`);
      }

      return result;
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [processBatch, setPriority, success, error, deselectAll]);

  const bulkUpdate = useCallback(async (taskIds: string[], updates: Partial<Task>) => {
    if (taskIds.length === 0) return { success: false, processed: 0, failed: 0, errors: ["No tasks selected"] };

    setIsProcessing(true);
    setProgress({ current: 0, total: taskIds.length });

    try {
      const result = await processBatch(
        taskIds,
        async (taskId) => {
          const updateResult = await updateTask({ id: taskId, ...updates });
          return { success: updateResult.success, error: updateResult.success ? undefined : "Failed to update task" };
        },
        (current, total) => setProgress({ current, total })
      );

      if (result.success) {
        success(`Successfully updated ${result.processed} tasks`);
        deselectAll();
      } else {
        error(`Failed to update ${result.failed} out of ${taskIds.length} tasks`);
      }

      return result;
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [processBatch, updateTask, success, error, deselectAll]);

  // Computed values
  const selectedCount = selectedItems.size;
  const hasSelection = selectedCount > 0;
  const isAllSelected = useCallback((items: string[]) => 
    items.length > 0 && items.every(id => selectedItems.has(id)), [selectedItems]
  );
  const isSomeSelected = useCallback((items: string[]) => 
    items.some(id => selectedItems.has(id)), [selectedItems]
  );

  // Keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent, items: string[], focusedIndex: number) => {
    if (event.key === "a" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      selectAll(items);
    } else if (event.key === "Escape") {
      deselectAll();
    } else if (event.key === " " && focusedIndex >= 0) {
      event.preventDefault();
      toggleItem(items[focusedIndex]);
    } else if (event.shiftKey && event.key === "ArrowUp" && focusedIndex > 0) {
      event.preventDefault();
      selectRange(items, focusedIndex - 1, focusedIndex);
    } else if (event.shiftKey && event.key === "ArrowDown" && focusedIndex < items.length - 1) {
      event.preventDefault();
      selectRange(items, focusedIndex, focusedIndex + 1);
    }
  }, [selectAll, deselectAll, toggleItem, selectRange]);

  return {
    // Selection state
    selectedItems: Array.from(selectedItems),
    selectedCount,
    hasSelection,
    isProcessing,
    progress,

    // Selection actions
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    selectRange,

    // Bulk operations
    bulkMove,
    bulkDelete,
    bulkAssign,
    bulkSetPriority,
    bulkUpdate,

    // Utilities
    isSelected: useCallback((id: string) => selectedItems.has(id), [selectedItems]),
    isAllSelected,
    isSomeSelected,
    handleKeyDown,

    // Progress helpers
    getProgressPercentage: () => progress.total > 0 ? (progress.current / progress.total) * 100 : 0,
    getProgressText: () => `${progress.current} / ${progress.total}`,
  };
};