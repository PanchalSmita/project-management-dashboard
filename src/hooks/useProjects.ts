import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  addProject,
  updateProject,
  removeProject,
  setSelectedProject,
  setLoading
} from "../redux/slices/projectSlice";
import { useNotifications } from "./useNotifications";
import { useAuth } from "./useAuth";
import type { Project } from "../types";

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
}

export const useProjects = () => {
  const { projects, selectedProjectId, isLoading } = useAppSelector((state) => state.projects);
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { success, error } = useNotifications();

  const selectedProject = useMemo(() =>
    projects.find(p => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const userProjects = useMemo(() => {
    if (user?.role === "ADMIN" || user?.role === "MANAGER") {
      return projects;
    }
    return projects.filter(p => p.ownerId === user?.id || p.members.includes(user?.id || ""));
  }, [projects, user?.id, user?.role]);

  const ownedProjects = useMemo(() =>
    projects.filter(p => p.ownerId === user?.id),
    [projects, user?.id]
  );

  const createProject = useCallback(async (data: CreateProjectData) => {
    if (!user) {
      error("You must be logged in to create a project");
      return { success: false };
    }

    try {
      dispatch(setLoading(true));
      const newProject: Project = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        ownerId: user.id,
        members: [user.id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: data.color,
      };

      dispatch(addProject(newProject));
      success(`Project "${data.name}" created successfully!`);
      return { success: true, project: newProject };
    } catch (err) {
      error("Failed to create project");
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch, success, error]);

  const updateProjectData = useCallback(async (id: string, updates: Partial<Project>) => {
    const project = projects.find(p => p.id === id);
    if (!project) {
      error("Project not found");
      return { success: false };
    }

    if (project.ownerId !== user?.id && !user?.role.includes("ADMIN")) {
      error("You don't have permission to update this project");
      return { success: false };
    }

    try {
      dispatch(setLoading(true));
      const updatedProject = {
        ...project,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      dispatch(updateProject(updatedProject));
      success("Project updated successfully!");
      return { success: true, project: updatedProject };
    } catch (err) {
      error("Failed to update project");
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }, [projects, user, dispatch, success, error]);

  const deleteProject = useCallback(async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) {
      error("Project not found");
      return { success: false };
    }

    if (project.ownerId !== user?.id && !user?.role.includes("ADMIN")) {
      error("You don't have permission to delete this project");
      return { success: false };
    }

    try {
      dispatch(setLoading(true));
      dispatch(removeProject(id));
      success(`Project "${project.name}" deleted successfully!`);

      // Clear selection if deleted project was selected
      if (selectedProjectId === id) {
        dispatch(setSelectedProject(null));
      }

      return { success: true };
    } catch (err) {
      error("Failed to delete project");
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  }, [projects, user, selectedProjectId, dispatch, success, error]);

  const selectProject = useCallback((projectId: string | null) => {
    dispatch(setSelectedProject(projectId));
  }, [dispatch]);

  const addMember = useCallback(async (projectId: string, userId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      error("Project not found");
      return { success: false };
    }

    if (project.members.includes(userId)) {
      error("User is already a member of this project");
      return { success: false };
    }

    const updatedMembers = [...project.members, userId];
    return updateProjectData(projectId, { members: updatedMembers });
  }, [projects, updateProjectData, error]);

  const removeMember = useCallback(async (projectId: string, userId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      error("Project not found");
      return { success: false };
    }

    if (project.ownerId === userId) {
      error("Cannot remove project owner");
      return { success: false };
    }

    const updatedMembers = project.members.filter(id => id !== userId);
    return updateProjectData(projectId, { members: updatedMembers });
  }, [projects, updateProjectData, error]);

  return {
    // State
    projects: userProjects,
    allProjects: projects,
    ownedProjects,
    selectedProject,
    selectedProjectId,
    isLoading,

    // Actions
    createProject,
    updateProject: updateProjectData,
    deleteProject,
    selectProject,
    addMember,
    removeMember,

    // Utilities
    getProjectById: useCallback((id: string) => projects.find(p => p.id === id), [projects]),
    isProjectOwner: useCallback((projectId: string) => {
      const project = projects.find(p => p.id === projectId);
      return project?.ownerId === user?.id;
    }, [projects, user?.id]),
    isProjectMember: useCallback((projectId: string) => {
      const project = projects.find(p => p.id === projectId);
      return project?.members.includes(user?.id || "") || false;
    }, [projects, user?.id]),
  };
};