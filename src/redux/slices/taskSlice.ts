import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Task } from "../../types";

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  isLoading: false,
  error: null,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
      state.error = null;
    },

    updateTask: (state, action: PayloadAction<Task>) => {
      const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (idx >= 0) {
        state.tasks[idx] = { ...state.tasks[idx], ...action.payload };
      }
      state.error = null;
    },

    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      state.error = null;
    },

    moveTask: (state, action: PayloadAction<{ taskId: string; toBoardId: string }>) => {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        task.boardId = action.payload.toBoardId;
        task.updatedAt = new Date().toISOString();
      }
      state.error = null;
    },

    reorderTasks: (state, action: PayloadAction<{ boardId: string; taskIds: string[] }>) => {
      const { boardId, taskIds } = action.payload;
      const boardTasks = state.tasks.filter(t => t.boardId === boardId);
      
      taskIds.forEach((taskId, index) => {
        const task = boardTasks.find(t => t.id === taskId);
        if (task) {
          const taskIndex = state.tasks.findIndex(t => t.id === taskId);
          if (taskIndex >= 0) {
            state.tasks[taskIndex].order = index;
            state.tasks[taskIndex].updatedAt = new Date().toISOString();
          }
        }
      });
    },

    bulkUpdateTasks: (state, action: PayloadAction<{ taskIds: string[]; updates: Partial<Task> }>) => {
      const { taskIds, updates } = action.payload;
      taskIds.forEach(taskId => {
        const taskIndex = state.tasks.findIndex(t => t.id === taskId);
        if (taskIndex >= 0) {
          state.tasks[taskIndex] = {
            ...state.tasks[taskIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
      });
      state.error = null;
    },

    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.error = null;
    },
  },
});

export const { 
  addTask, 
  updateTask, 
  removeTask, 
  moveTask, 
  reorderTasks,
  bulkUpdateTasks,
  setTasks,
  setLoading,
  setError 
} = taskSlice.actions;
export default taskSlice.reducer;