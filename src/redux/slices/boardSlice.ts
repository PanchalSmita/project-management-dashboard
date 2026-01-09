import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Board } from "../../types";

interface BoardState {
  boards: Board[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BoardState = {
  boards: [],
  isLoading: false,
  error: null,
};

const boardSlice = createSlice({
  name: "boards",
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

    addBoard: (state, action: PayloadAction<Board>) => {
      state.boards.push(action.payload);
      state.error = null;
    },

    updateBoard: (state, action: PayloadAction<Board>) => {
      const idx = state.boards.findIndex((b) => b.id === action.payload.id);
      if (idx >= 0) {
        state.boards[idx] = { ...state.boards[idx], ...action.payload };
      }
      state.error = null;
    },

    removeBoard: (state, action: PayloadAction<string>) => {
      state.boards = state.boards.filter((b) => b.id !== action.payload);
      state.error = null;
    },

    setBoards: (state, action: PayloadAction<Board[]>) => {
      state.boards = action.payload;
      state.error = null;
    },

    reorderBoards: (state, action: PayloadAction<{ projectId: string; boardIds: string[] }>) => {
      const { projectId, boardIds } = action.payload;
      const projectBoards = state.boards.filter(b => b.projectId === projectId);
      
      boardIds.forEach((boardId, index) => {
        const board = projectBoards.find(b => b.id === boardId);
        if (board) {
          const boardIndex = state.boards.findIndex(b => b.id === boardId);
          if (boardIndex >= 0) {
            state.boards[boardIndex].order = index;
          }
        }
      });
    },
  },
});

export const { 
  addBoard, 
  updateBoard, 
  removeBoard, 
  setBoards, 
  reorderBoards,
  setLoading,
  setError 
} = boardSlice.actions;
export default boardSlice.reducer;
