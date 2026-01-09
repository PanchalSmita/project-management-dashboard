import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Project } from "../../types";

interface ProjectState {
  projects: Project[];
  selectedProjectId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  selectedProjectId: null,
  isLoading: false,
  error: null,
};

const projectSlice = createSlice({
  name: "projects",
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

    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
      state.error = null;
    },

    updateProject: (state, action: PayloadAction<Project>) => {
      const idx = state.projects.findIndex((p) => p.id === action.payload.id);
      if (idx >= 0) {
        state.projects[idx] = { ...state.projects[idx], ...action.payload };
      }
      state.error = null;
    },

    removeProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.selectedProjectId === action.payload) {
        state.selectedProjectId = null;
      }
      state.error = null;
    },

    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
      state.error = null;
    },

    setSelectedProject: (state, action: PayloadAction<string | null>) => {
      state.selectedProjectId = action.payload;
    },
  },
});

export const { 
  addProject, 
  updateProject, 
  removeProject, 
  setProjects, 
  setSelectedProject,
  setLoading,
  setError 
} = projectSlice.actions;
export default projectSlice.reducer;