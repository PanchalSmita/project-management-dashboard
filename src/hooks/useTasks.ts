import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { 
  addTask, 
  updateTask, 
  removeTask, 
  moveTask,
  reorderTasks,
  setLoading 
} from "../redux/slices/taskSlice";
import { useNotifications } from "./useNotifications";
import { useAuth } from "./useAuth";
import type { Task, Priority } from "../types";

export interface CreateTaskData {
  title: string;
  description?: string;
  boardId: string;
  projectId: string;
  priority?: Priority;
  assigneeId?: string;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string;
}

export interface BulkTaskAction {
  taskIds: string[];
  action: "move" | "delete" | "assign" | "setPriority";
  payload?: any;
}

export const useTasks = () => {
  const taskState = useAppSelector((state) => state.tasks);
  const { tasks = [], isLoading = false } = taskState || {};
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { success, error } = useNotifications();

  const getTasksByBoard = useCallback((boardId: string) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks
      .filter(task => task?.boardId === boardId)
      .sort((a, b) => (a?.order || 0) - (b?.order || 0));
  }, [tasks]);

  const getTasksByProject = useCallback((projectId: string) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.filter(task => task?.projectId === projectId);
  }, [tasks]);

  const getTasksByAssignee = useCallback((assigneeId: string) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.filter(task => task?.assigneeId === assigneeId);
  }, [tasks]);

  const getOverdueTasks = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      if (!task?.dueDate) return false;
      return new Date(task.dueDate) < new Date();
    });
  }, [tasks]);

  const getTasksByPriority = useCallback((priority: Priority) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.filter(task => task?.priority === priority);
  }, [tasks]);

  const createTask = useCallback(async (data: CreateTaskData) => {
    if (!user) {
      error("You must be logged in to create a task");
      return { success: false };
    }

    try {
      dispatch(setLoading(true));
      const boardTasks = getTasksByBoard(data.boardId);
      const newTask: Task = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        boardId: data.boardId,
        projectId: data.projectId,
        priority: data.priority || "MEDIUM",
        assigneeId: data.assigneeId,
        dueDate: data.dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: data.tags || [],
        attachments: [],
        comments: [],
        order: boardTasks.length,
      };

      dispatch(addTask(newTask));
      success(`Task "${data.title}" created successfully!`);
      return { success: true, task: newTask };
    } catch (err) {
      error("Failed to create task");
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch, success, error, getTasksByBoard]);

  const updateTaskData = useCallback(async (data: UpdateTaskData) => {
    if (!tasks || !Array.isArray(tasks)) {
      error("Tasks not available");
      return { success: false };
    }
    
    const task = tasks.find(t => t?.id === data.id);
    if (!task) {
      error("Task not found");
      return { success: false };
    }

    try {
      dispatch(setLoading(true));
      const updatedTask = {
        ...task,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      dispatch(updateTask(updatedTask));
      success("Task updated successfully!");
      return { success: true, task: updatedTask };
    } catch (err) {
      error("Failed to update task");
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }, [tasks, dispatch, success, error]);

  const deleteTask = useCallback(async (id: string) => {
    if (!tasks || !Array.isArray(tasks)) {
      error("Tasks not available");
      return { success: false };
    }
    
    const task = tasks.find(t => t?.id === id);
    if (!task) {
      error("Task not found");
      return { success: false };
    }

    try {
      dispatch(setLoading(true));
      dispatch(removeTask(id));
      success(`Task "${task.title}" deleted successfully!`);
      return { success: true };
    } catch (err) {
      error("Failed to delete task");
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }, [tasks, dispatch, success, error]);

  const moveTaskToBoard = useCallback(async (taskId: string, toBoardId: string) => {
    if (!tasks || !Array.isArray(tasks)) {
      error("Tasks not available");
      return { success: false };
    }
    
    const task = tasks.find(t => t?.id === taskId);
    if (!task) {
      error("Task not found");
      return { success: false };
    }

    if (task.boardId === toBoardId) {
      return { success: true }; // No change needed
    }

    try {
      dispatch(setLoading(true));
      dispatch(moveTask({ taskId, toBoardId }));
      success("Task moved successfully!");
      return { success: true };
    } catch (err) {
      error("Failed to move task");
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }, [tasks, dispatch, success, error]);

  const reorderBoardTasks = useCallback(async (boardId: string, taskIds: string[]) => {
    try {
      dispatch(setLoading(true));
      dispatch(reorderTasks({ boardId, taskIds }));
      return { success: true };
    } catch (err) {
      error("Failed to reorder tasks");
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, error]);

  const duplicateTask = useCallback(async (taskId: string) => {
    if (!tasks || !Array.isArray(tasks)) {
      error("Tasks not available");
      return { success: false };
    }
    
    const task = tasks.find(t => t?.id === taskId);
    if (!task) {
      error("Task not found");
      return { success: false };
    }

    const duplicateData: CreateTaskData = {
      title: `${task.title} (Copy)`,
      description: task.description,
      boardId: task.boardId,
      projectId: task.projectId,
      priority: task.priority,
      assigneeId: task.assigneeId,
      dueDate: task.dueDate,
      tags: [...(task.tags || [])],
    };

    return createTask(duplicateData);
  }, [tasks, createTask, error]);

  const assignTask = useCallback(async (taskId: string, assigneeId: string | undefined) => {
    return updateTaskData({ id: taskId, assigneeId });
  }, [updateTaskData]);

  const setPriority = useCallback(async (taskId: string, priority: Priority) => {
    return updateTaskData({ id: taskId, priority });
  }, [updateTaskData]);

  const setDueDate = useCallback(async (taskId: string, dueDate: string | undefined) => {
    return updateTaskData({ id: taskId, dueDate });
  }, [updateTaskData]);

  const addTag = useCallback(async (taskId: string, tag: string) => {
    if (!tasks || !Array.isArray(tasks)) {
      error("Tasks not available");
      return { success: false };
    }
    
    const task = tasks.find(t => t?.id === taskId);
    if (!task) {
      error("Task not found");
      return { success: false };
    }

    const tags = task.tags || [];
    if (tags.includes(tag)) {
      return { success: true }; // Tag already exists
    }

    return updateTaskData({ id: taskId, tags: [...tags, tag] });
  }, [tasks, updateTaskData, error]);

  const removeTag = useCallback(async (taskId: string, tag: string) => {
    if (!tasks || !Array.isArray(tasks)) {
      error("Tasks not available");
      return { success: false };
    }
    
    const task = tasks.find(t => t?.id === taskId);
    if (!task) {
      error("Task not found");
      return { success: false };
    }

    const tags = (task.tags || []).filter(t => t !== tag);
    return updateTaskData({ id: taskId, tags });
  }, [tasks, updateTaskData, error]);

  const bulkAction = useCallback(async (action: BulkTaskAction) => {
    try {
      dispatch(setLoading(true));
      
      switch (action.action) {
        case "move":
          for (const taskId of action.taskIds) {
            await moveTaskToBoard(taskId, action.payload.boardId);
          }
          break;
        case "delete":
          for (const taskId of action.taskIds) {
            await deleteTask(taskId);
          }
          break;
        case "assign":
          for (const taskId of action.taskIds) {
            await assignTask(taskId, action.payload.assigneeId);
          }
          break;
        case "setPriority":
          for (const taskId of action.taskIds) {
            await setPriority(taskId, action.payload.priority);
          }
          break;
      }

      success(`Bulk action completed for ${action.taskIds.length} tasks`);
      return { success: true };
    } catch (err) {
      error("Failed to perform bulk action");
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, success, error, moveTaskToBoard, deleteTask, assignTask, setPriority]);

  return {
    // State
    tasks: tasks || [],
    isLoading,
    overdueTasks: getOverdueTasks,

    // Actions
    createTask,
    updateTask: updateTaskData,
    deleteTask,
    moveTask: moveTaskToBoard,
    reorderTasks: reorderBoardTasks,
    duplicateTask,
    assignTask,
    setPriority,
    setDueDate,
    addTag,
    removeTag,
    bulkAction,

    // Utilities
    getTasksByBoard,
    getTasksByProject,
    getTasksByAssignee,
    getTasksByPriority,
    getTaskById: useCallback((id: string) => {
      if (!tasks || !Array.isArray(tasks)) return undefined;
      return tasks.find(t => t?.id === id);
    }, [tasks]),
    getTaskCount: useCallback((boardId?: string, projectId?: string) => {
      if (!tasks || !Array.isArray(tasks)) return 0;
      if (boardId) return tasks.filter(t => t?.boardId === boardId).length;
      if (projectId) return tasks.filter(t => t?.projectId === projectId).length;
      return tasks.length;
    }, [tasks]),
  };
};