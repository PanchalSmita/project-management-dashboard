export type Role = "ADMIN" | "USER" | "MANAGER";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  lastActive?: string;
  password?: string; // Simulated password for demo
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
  color?: string;
}

export interface Board {
  id: string;
  title: string;
  projectId: string;
  order: number;
  color?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  boardId: string;
  projectId: string;
  priority: Priority;
  assigneeId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  attachments?: string[];
  comments?: Comment[];
  order: number;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  timestamp: string;
  read: boolean;
}

export interface FilterOptions {
  search?: string;
  priority?: Priority;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
}

export interface SortOptions {
  field: "title" | "priority" | "dueDate" | "createdAt" | "updatedAt";
  direction: "asc" | "desc";
}
