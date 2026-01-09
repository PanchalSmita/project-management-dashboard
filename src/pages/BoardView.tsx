import { useState, useMemo } from "react";
import { useBoards } from "../hooks/useBoards";
import { useTasks } from "../hooks/useTasks";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useProjects } from "../hooks/useProjects";
import { useNotifications } from "../hooks/useNotifications";
import { useFilterAndSort } from "../hooks/useFilterAndSort";
// import { useAuth } from "../hooks/useAuth";
import {
  FiPlus,
  FiMoreHorizontal,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import TaskModal, { type Task } from "../components/tasks/TaskModal";
import type { Priority } from "../types";

const BoardView = () => {
  // const { user } = useAuth();
  const { selectedProject } = useProjects();
  const { getBoardsByProject } = useBoards();
  const { getTasksByProject, createTask, deleteTask, updateTask } = useTasks();
  const {
    createDragHandlers,
    createDropHandlers,
    isDraggedItem,
    isDraggedOver,
  } = useDragAndDrop();
  const { success, error } = useNotifications();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const projectId = selectedProject?.id || "default-project";
  const boards = getBoardsByProject(projectId);

  // Filter & Sort Logic
  const tasksForProject = useMemo(
    () => getTasksByProject(projectId),
    [getTasksByProject, projectId, isTaskModalOpen]
  );
  const { filteredTasks, filters, setSearch, setPriority, setSortField, sort } =
    useFilterAndSort(tasksForProject);

  const handleCreateTask = async (boardId: string) => {
    if (!newTaskTitle.trim()) {
      error("Task title is required");
      return;
    }
    const result = await createTask({
      title: newTaskTitle.trim(),
      boardId,
      projectId,
      priority: "MEDIUM",
    });
    if (result.success) {
      setNewTaskTitle("");
      setSelectedBoardId(null);
      success("Task created successfully!");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask(taskId);
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    let result;

    if (taskData.id) {
      // Update existing
      result = await updateTask({
        id: taskData.id,
        ...taskData,
      });
    } else {
      // Create new
      if (!taskData.title || !taskData.boardId) {
        error("Title and Board are required");
        return;
      }
      result = await createTask({
        title: taskData.title,
        boardId: taskData.boardId,
        projectId,
        priority: taskData.priority || "MEDIUM",
        description: taskData.description,
        dueDate: taskData.dueDate,
        assigneeId: taskData.assigneeId,
      });
    }

    if (result.success) {
      success(
        taskData.id ? "Task updated successfully" : "Task created successfully"
      );
      setIsTaskModalOpen(false);
      setEditingTask(null);
    }
  };

  const openEditTaskModal = (task: Task) => {
    // Cast the task layout type to the modal Task type
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Default boards
  const defaultBoards = [
    { id: "todo", title: "To Do", color: "bg-orange-500" },
    { id: "inprogress", title: "In Progress", color: "bg-blue-500" },
    { id: "done", title: "Done", color: "bg-green-500" },
  ];

  const displayBoards = boards.length > 0 ? boards : defaultBoards;

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-background">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-border bg-background/50 backdrop-blur-sm z-10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {selectedProject?.name || "Board"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
            {selectedProject?.description || "Manage your tasks"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 h-8 bg-secondary/50 border border-transparent rounded-md text-sm focus:border-ring focus:ring-1 focus:ring-ring w-48 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button
                className={`flex items-center gap-1.5 px-2.5 py-1.5 h-8 rounded-md border text-xs font-medium transition-colors ${
                  filters.priority !== "ALL"
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card border-border hover:bg-secondary"
                }`}
              >
                <FiFilter className="w-3.5 h-3.5" />
                <span>
                  {filters.priority === "ALL" ? "Priority" : filters.priority}
                </span>
              </button>
              <select
                title=" Priority"
                value={filters.priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="relative group">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 h-8 bg-card border border-border rounded-md text-xs font-medium hover:bg-secondary transition-colors">
                {sort.direction === "asc" ? (
                  <FiArrowUp className="w-3.5 h-3.5" />
                ) : (
                  <FiArrowDown className="w-3.5 h-3.5" />
                )}
                <span>Sort</span>
              </button>
              <select
                title="sorting"
                value={sort.field}
                onChange={(e) => setSortField(e.target.value as any)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              >
                <option value="createdAt">Date Created</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>

          <div className="w-px h-6 bg-border mx-1"></div>

          <button
            onClick={() => {
              // Default to first board or 'todo'
              const defaultBoardId = displayBoards[0]?.id || "todo";
              setEditingTask({
                id: "",
                title: "",
                priority: "MEDIUM",
                boardId: defaultBoardId,
              } as Task);
              setIsTaskModalOpen(true);
            }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 transition-all text-sm font-medium"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Board Canvas */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex h-full gap-6">
          {displayBoards.map((board) => {
            // Filter tasks for this board from the globally filtered list
            const boardTasks = filteredTasks.filter(
              (t) => t.boardId === board.id
            );
            const isTarget = isDraggedOver(board.id);

            return (
              <div
                key={board.id}
                className={`flex-none w-80 flex flex-col rounded-xl bg-secondary/30 border border-transparent transition-colors ${
                  isTarget
                    ? "bg-primary/5 border-primary/20"
                    : "bg-card border-border/50"
                }`}
                {...createDropHandlers(board.id)}
              >
                {/* Column Header */}
                <div className="flex-none p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        board.color?.startsWith("bg-")
                          ? board.color
                          : "bg-primary"
                      }`}
                      style={
                        !board.color?.startsWith("bg-")
                          ? { backgroundColor: board.color }
                          : {}
                      }
                    />
                    <h3 className="font-semibold text-sm text-foreground">
                      {board.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                      {boardTasks.length}
                    </span>
                  </div>
                  <button
                    title="More"
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-secondary rounded text-muted-foreground transition-all"
                  >
                    <FiMoreHorizontal />
                  </button>
                </div>

                {/* Tasks Container */}
                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3 min-h-[100px]">
                  {boardTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`
                        group relative bg-card p-3.5 rounded-lg border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-grab active:cursor-grabbing
                        ${
                          isDraggedItem(task.id)
                            ? "opacity-40 rotate-2 scale-95"
                            : ""
                        }
                      `}
                      {...createDragHandlers({
                        id: task.id,
                        type: "task",
                        data: task,
                        sourceIndex: 0,
                        sourceBoardId: board.id,
                      })}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                            task.priority === "HIGH"
                              ? "bg-red-500/10 text-red-600"
                              : task.priority === "MEDIUM"
                              ? "bg-orange-500/10 text-orange-600"
                              : "bg-blue-500/10 text-blue-600"
                          }`}
                        >
                          {task.priority || "NORMAL"}
                        </span>

                        {/* CRUD Actions on Hover */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditTaskModal(task);
                            }}
                            className="p-1 text-muted-foreground hover:text-primary hover:bg-secondary rounded"
                            title="Edit"
                          >
                            <FiEdit2 size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                            title="Delete"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-medium text-foreground mb-1 leading-snug">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                          <FiCalendar className="w-3 h-3" />
                          <span>
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : "No Date"}
                          </span>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-secondary text-[10px] flex items-center justify-center font-medium">
                          U
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Task Input */}
                  {selectedBoardId === board.id ? (
                    <div className="bg-card p-3 rounded-lg border border-primary/50 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Task title..."
                        className="w-full text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground mb-3"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateTask(board.id);
                          if (e.key === "Escape") setSelectedBoardId(null);
                        }}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedBoardId(null)}
                          className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleCreateTask(board.id)}
                          className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedBoardId(board.id)}
                      className="w-full py-2 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg border border-dashed border-border hover:border-primary/30 transition-all"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Task
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Column Button */}
        </div>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialData={editingTask || undefined}
        mode={editingTask?.id ? "edit" : "create"}
      />
    </div>
  );
};

export default BoardView;
