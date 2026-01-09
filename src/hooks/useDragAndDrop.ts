import { useState, useCallback, useRef } from "react";
import { useTasks } from "./useTasks";
import { useNotifications } from "./useNotifications";
import type { Task } from "../types";

export interface DragItem {
  id: string;
  type: "task" | "board";
  data: Task | any;
  sourceIndex: number;
  sourceBoardId?: string;
}

export interface DropResult {
  targetBoardId: string;
  targetIndex: number;
}

export const useDragAndDrop = () => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTime = useRef<number>(0);
  
  const { moveTask } = useTasks();
  const { success, error } = useNotifications();

  const handleDragStart = useCallback((item: DragItem) => {
    setDraggedItem(item);
    setIsDragging(true);
    dragStartTime.current = Date.now();
    
    // Add visual feedback
    document.body.style.cursor = "grabbing";
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverTarget(null);
    setIsDragging(false);
    
    // Remove visual feedback
    document.body.style.cursor = "";
  }, []);

  const handleDragOver = useCallback((targetId: string) => {
    setDragOverTarget(targetId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverTarget(null);
  }, []);

  const handleDrop = useCallback(async (result: DropResult) => {
    if (!draggedItem) return { success: false };

    try {
      if (draggedItem.type === "task") {
        const task = draggedItem.data as Task;
        
        // If dropping in the same board, reorder
        if (task.boardId === result.targetBoardId) {
          // Handle reordering within the same board
          // This would require getting all tasks in the board and reordering them
          success("Task reordered successfully!");
        } else {
          // Move to different board
          await moveTask(task.id, result.targetBoardId);
          success(`Task moved to new board!`);
        }
      }
      
      return { success: true };
    } catch (err) {
      error("Failed to move item");
      return { success: false };
    } finally {
      handleDragEnd();
    }
  }, [draggedItem, moveTask, success, error, handleDragEnd]);

  // Native HTML5 Drag and Drop handlers
  const createDragHandlers = useCallback((item: DragItem) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData("application/json", JSON.stringify(item));
      e.dataTransfer.effectAllowed = "move";
      handleDragStart(item);
    },
    onDragEnd: handleDragEnd,
  }), [handleDragStart, handleDragEnd]);

  const createDropHandlers = useCallback((targetBoardId: string, targetIndex: number = 0) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      handleDragOver(targetBoardId);
    },
    onDragLeave: handleDragLeave,
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const dragData = e.dataTransfer.getData("application/json");
      
      if (dragData) {
        try {
          const item = JSON.parse(dragData) as DragItem;
          setDraggedItem(item);
          handleDrop({ targetBoardId, targetIndex });
        } catch (err) {
          error("Invalid drag data");
        }
      }
    },
  }), [handleDragOver, handleDragLeave, handleDrop, error]);

  // Touch/Mobile drag handlers
  const createTouchHandlers = useCallback((item: DragItem) => {
    let touchStartPos = { x: 0, y: 0 };
    let isDragStarted = false;

    return {
      onTouchStart: (e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStartPos = { x: touch.clientX, y: touch.clientY };
        isDragStarted = false;
      },
      onTouchMove: (e: React.TouchEvent) => {
        if (!isDragStarted) {
          const touch = e.touches[0];
          const deltaX = Math.abs(touch.clientX - touchStartPos.x);
          const deltaY = Math.abs(touch.clientY - touchStartPos.y);
          
          // Start drag if moved more than threshold
          if (deltaX > 10 || deltaY > 10) {
            isDragStarted = true;
            handleDragStart(item);
          }
        }
        
        if (isDragStarted) {
          e.preventDefault();
          // Update drag position for visual feedback
        }
      },
      onTouchEnd: () => {
        if (isDragStarted) {
          // Find drop target based on touch position
          // This is a simplified version - you'd need to implement proper touch drop detection
          handleDragEnd();
        }
      },
    };
  }, [handleDragStart, handleDragEnd]);

  // Utility functions
  const canDrop = useCallback((sourceItem: DragItem) => {
    if (sourceItem.type === "task") {
      // Tasks can be dropped on any board
      return true;
    }
    return false;
  }, []);

  const getDropEffect = useCallback((sourceItem: DragItem, targetBoardId: string) => {
    if (!canDrop(sourceItem)) return "none";
    
    if (sourceItem.type === "task") {
      const task = sourceItem.data as Task;
      return task.boardId === targetBoardId ? "copy" : "move";
    }
    
    return "move";
  }, [canDrop]);

  return {
    // State
    draggedItem,
    dragOverTarget,
    isDragging,

    // Handlers
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,

    // Helper functions
    createDragHandlers,
    createDropHandlers,
    createTouchHandlers,
    canDrop,
    getDropEffect,

    // Utilities
    isDraggedOver: useCallback((targetId: string) => dragOverTarget === targetId, [dragOverTarget]),
    isDraggedItem: useCallback((itemId: string) => draggedItem?.id === itemId, [draggedItem]),
  };
};
