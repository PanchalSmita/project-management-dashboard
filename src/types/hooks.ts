// Shared TypeScript interfaces and types for all hooks

// Base hook return pattern
export interface HookReturn<T, E = Error> {
  data: T | null;
  loading: boolean;
  error: E | null;
}

// Action result pattern
export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'User';
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: 'Admin' | 'User';
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<ActionResult<AuthUser>>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<ActionResult<AuthUser>>;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  members: string[];
  status?: 'active' | 'completed' | 'archived';
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
}

export interface UseProjectsReturn {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  createProject: (data: CreateProjectData) => Promise<ActionResult<Project>>;
  updateProject: (id: string, data: UpdateProjectData) => Promise<ActionResult<Project>>;
  deleteProject: (id: string) => Promise<ActionResult>;
  selectProject: (id: string) => void;
}

// Board types
export interface Board {
  id: string;
  name: string;
  projectId: string;
  order: number;
  color?: string;
}

export interface CreateBoardData {
  name: string;
  projectId: string;
  color?: string;
}

export interface UpdateBoardData {
  name?: string;
  color?: string;
  order?: number;
}

export interface UseBoardsReturn {
  boards: Board[];
  isLoading: boolean;
  createBoard: (data: CreateBoardData) => Promise<ActionResult<Board>>;
  updateBoard: (id: string, data: UpdateBoardData) => Promise<ActionResult<Board>>;
  deleteBoard: (id: string) => Promise<ActionResult>;
  reorderBoards: (boardIds: string[]) => Promise<ActionResult>;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  boardId: string;
  projectId: string;
  assigneeId?: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  order: number;
  status?: 'todo' | 'in-progress' | 'done';
}

export interface CreateTaskData {
  title: string;
  description?: string;
  boardId: string;
  projectId: string;
  assigneeId?: string;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: Date;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  boardId?: string;
  assigneeId?: string;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: Date;
  status?: 'todo' | 'in-progress' | 'done';
}

export interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  createTask: (data: CreateTaskData) => Promise<ActionResult<Task>>;
  updateTask: (id: string, data: UpdateTaskData) => Promise<ActionResult<Task>>;
  deleteTask: (id: string) => Promise<ActionResult>;
  moveTask: (taskId: string, toBoardId: string, newOrder: number) => Promise<ActionResult>;
  assignTask: (taskId: string, assigneeId: string) => Promise<ActionResult>;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByBoard: (boardId: string) => Task[];
}

// Drag and Drop types
export interface DragItem {
  id: string;
  type: 'task';
  boardId: string;
  order: number;
}

export interface UseDragAndDropReturn {
  draggedItem: DragItem | null;
  isDragging: boolean;
  handleDragStart: (item: DragItem) => void;
  handleDragEnd: () => void;
  handleDrop: (targetBoardId: string, targetOrder: number) => Promise<ActionResult>;
  canDrop: (targetBoardId: string) => boolean;
}

// User Management types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  avatar?: string;
  isActive: boolean;
}

export interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  inviteUser: (email: string, role: 'Admin' | 'User') => Promise<ActionResult>;
  removeUser: (userId: string) => Promise<ActionResult>;
  updateUserRole: (userId: string, role: 'Admin' | 'User') => Promise<ActionResult>;
}

// Persisted State types
export interface UsePersistedStateReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  clearValue: () => void;
}

// Modal types
export interface ModalState {
  isOpen: boolean;
  type: 'create-task' | 'edit-task' | 'view-task' | 'create-project' | 'create-board' | null;
  data?: any;
}

export interface UseModalReturn {
  modal: ModalState;
  openModal: (type: ModalState['type'], data?: any) => void;
  closeModal: () => void;
  isModalOpen: (type?: ModalState['type']) => boolean;
}

// Filter and Sort types
export interface FilterOptions {
  priority?: 'Low' | 'Medium' | 'High';
  assignee?: string;
  dueDate?: { start?: Date; end?: Date };
  search?: string;
  status?: 'todo' | 'in-progress' | 'done';
}

export interface SortOptions {
  field: 'priority' | 'dueDate' | 'createdAt' | 'title' | 'assignee';
  direction: 'asc' | 'desc';
}

export interface UseFilterAndSortReturn {
  filteredTasks: Task[];
  filters: FilterOptions;
  sortOptions: SortOptions;
  setFilter: (key: keyof FilterOptions, value: any) => void;
  clearFilters: () => void;
  setSortOptions: (options: SortOptions) => void;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

// Undo types (Stretch Goal)
export interface UndoableAction {
  type: string;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  description: string;
}

export interface UseUndoReturn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  addUndoableAction: (action: UndoableAction) => void;
  clearHistory: () => void;
}

// Bulk Actions types (Stretch Goal)
export interface UseBulkActionsReturn {
  selectedItems: string[];
  isSelectionMode: boolean;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectAll: (items: string[]) => void;
  clearSelection: () => void;
  toggleSelectionMode: () => void;
  bulkMove: (toBoardId: string) => Promise<ActionResult>;
  bulkDelete: () => Promise<ActionResult>;
}