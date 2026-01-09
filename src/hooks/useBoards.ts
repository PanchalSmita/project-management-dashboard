import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { 
  addBoard, 
  updateBoard, 
  removeBoard, 
  reorderBoards,
  setLoading 
} from "../redux/slices/boardSlice";
import { useNotifications } from "./useNotifications";
import { useAuth } from "./useAuth";
import type { Board } from "../types";

export interface CreateBoardData {
  title: string;
  projectId: string;
  color?: string;
}

export const useBoards = () => {
  const { boards, isLoading } = useAppSelector((state) => state.boards);
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { success, error } = useNotifications();

  const getBoardsByProject = useCallback((projectId: string) => 
    boards
      .filter(board => board.projectId === projectId)
      .sort((a, b) => a.order - b.order),
    [boards]
  );

  const createBoard = useCallback(async (data: CreateBoardData) => {
    if (!user) {
      error("You must be logged in to create a board");
      return { success: false };
    }

    try {
      dispatch(setLoading(true));
      const projectBoards = getBoardsByProject(data.projectId);
      const newBoard: Board = {
        id: Date.now().toString(),
        title: data.title,
        projectId: data.projectId,
        order: projectBoards.length,
        color: data.color,
        createdAt: new Date().toISOString(),
      };

      dispatch(addBoard(newBoard));
      success(`Board "${data.title}" created successfully!`);
      return { success: true, board: newBoard };
    } catch (err) {
      error("Failed to create board");
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch, success, error, getBoardsByProject]);

  const updateBoardData = useCallback(async (id: string, updates: Partial<Board>) => {
    const board = boards.find(b => b.id === id);
    if (!board) {
      error("Board not found");
      return { success: false };
    }

    try {
      dispatch(setLoading(true));
      const updatedBoard = { ...board, ...updates };
      dispatch(updateBoard(updatedBoard));
      success("Board updated successfully!");
      return { success: true, board: updatedBoard };
    } catch (err) {
      error("Failed to update board");
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }, [boards, dispatch, success, error]);

  const deleteBoard = useCallback(async (id: string) => {
    const board = boards.find(b => b.id === id);
    if (!board) {
      error("Board not found");
      return { success: false };
    }

    try {
      dispatch(setLoading(true));
      dispatch(removeBoard(id));
      success(`Board "${board.title}" deleted successfully!`);
      return { success: true };
    } catch (err) {
      error("Failed to delete board");
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }, [boards, dispatch, success, error]);

  const reorderProjectBoards = useCallback(async (projectId: string, boardIds: string[]) => {
    try {
      dispatch(setLoading(true));
      dispatch(reorderBoards({ projectId, boardIds }));
      success("Boards reordered successfully!");
      return { success: true };
    } catch (err) {
      error("Failed to reorder boards");
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, success, error]);

  const duplicateBoard = useCallback(async (boardId: string) => {
    const board = boards.find(b => b.id === boardId);
    if (!board) {
      error("Board not found");
      return { success: false };
    }

    const duplicateData: CreateBoardData = {
      title: `${board.title} (Copy)`,
      projectId: board.projectId,
      color: board.color,
    };

    return createBoard(duplicateData);
  }, [boards, createBoard, error]);

  // Default boards for new projects
  const createDefaultBoards = useCallback(async (projectId: string) => {
    const defaultBoards = [
      { title: "To Do", color: "#ef4444" },
      { title: "In Progress", color: "#f59e0b" },
      { title: "Done", color: "#10b981" },
    ];

    const results = [];
    for (const boardData of defaultBoards) {
      const result = await createBoard({ ...boardData, projectId });
      results.push(result);
    }

    return results;
  }, [createBoard]);

  return {
    // State
    boards,
    isLoading,

    // Actions
    createBoard,
    updateBoard: updateBoardData,
    deleteBoard,
    reorderBoards: reorderProjectBoards,
    duplicateBoard,
    createDefaultBoards,

    // Utilities
    getBoardsByProject,
    getBoardById: useCallback((id: string) => boards.find(b => b.id === id), [boards]),
    getBoardCount: useCallback((projectId: string) => 
      boards.filter(b => b.projectId === projectId).length, [boards]
    ),
  };
};