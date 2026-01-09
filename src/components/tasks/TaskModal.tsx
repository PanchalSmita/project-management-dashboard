
import React, { useState, useEffect } from "react";
import { FiX, FiCalendar, FiUser, FiFlag, FiCheck, FiAlignLeft } from "react-icons/fi";

import { useUsers } from "../../hooks/useUsers";

// Note: In a real app, these types should come from a shared types file
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  assigneeId?: string;
  boardId: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void; // Accepts updates
  initialData?: Task; // If editing
  mode: "create" | "edit" | "view";
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  mode 
}) => {
  const { users } = useUsers();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [boardId, setBoardId] = useState("");
  
  // Reset/Initialize form when opening
  useEffect(() => {
    if (isOpen && initialData && mode !== "create") {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setPriority(initialData.priority);
      setDueDate(initialData.dueDate ? initialData.dueDate.split('T')[0] : "");
      setAssigneeId(initialData.assigneeId || "");
      setBoardId(initialData.boardId || "");
    } else if (isOpen) { // Create mode (or just open)
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
      setAssigneeId("");
      // Preserve boardId if passed in initialData even for create
      setBoardId(initialData?.boardId || ""); 
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialData?.id, // Keep ID if editing
      title,
      description,
      priority,
      dueDate: dueDate || undefined,
      assigneeId: assigneeId || undefined,
      boardId, 
    });
    onClose();
  };

  const isReadOnly = mode === "view";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex-none px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/20">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {mode === "create" && "Create New Task"}
            {mode === "edit" && "Edit Task"}
            {mode === "view" && "Task Details"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task Title"
                readOnly={isReadOnly}
                className="w-full text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50 p-0"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
              {/* Left Column: Description & Activity */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <FiAlignLeft className="w-4 h-4" />
                    Description
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    readOnly={isReadOnly}
                    rows={6}
                    className="w-full rounded-md border border-input bg-secondary/10 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    placeholder="Add a detailed description..."
                  />
                </div>
              </div>

              {/* Right Column: Metadata */}
              <div className="space-y-6">
                
                {/* Status/Priority */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</label>
                  <div className="flex flex-wrap gap-2">
                    {(["LOW", "MEDIUM", "HIGH"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => setPriority(p)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all flex items-center gap-1.5 ${
                          priority === p 
                            ? (p === "HIGH" ? "bg-red-500/10 border-red-500 text-red-600" :
                                p === "MEDIUM" ? "bg-orange-500/10 border-orange-500 text-orange-600" :
                                "bg-blue-500/10 border-blue-500 text-blue-600")
                            : "bg-transparent border-border text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        <FiFlag className={`w-3 h-3 ${priority === p ? "fill-current" : ""}`} />
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due Date */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                    <input
                      type="date"
                      value={dueDate}
                      readOnly={isReadOnly}
                      onChange={(e) => setDueDate(e.target.value)}
                      onClick={(e) => !isReadOnly && e.currentTarget.showPicker?.()}
                      className="flex h-10 w-full rounded-md border border-input bg-card pl-10 pr-3 py-2 text-sm shadow-sm transition-all focus:border-primary focus:ring-1 focus:ring-ring outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark] text-foreground"
                    />
                  </div>
                </div>

                {/* Assignee */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assignee</label>
                  <div className="relative group">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                    <select
                      value={assigneeId}
                      disabled={isReadOnly}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background/50 pl-10 pr-10 py-2 text-sm shadow-sm transition-all focus:bg-background focus:ring-1 focus:ring-ring outline-none appearance-none cursor-pointer disabled:cursor-default"
                    >
                      <option value="" className="bg-background">Unassigned</option>
                      {users?.map(u => (
                        <option key={u.id} value={u.id} className="bg-background">
                          {u.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-foreground transition-colors">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 4.5L6 7.5L9 4.5" />
                      </svg>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex-none px-6 py-4 border-t border-border bg-secondary/20 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          {!isReadOnly && (
            <button
              type="submit"
              form="task-form"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
            >
              <FiCheck className="w-4 h-4" />
              Save Changes
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default TaskModal;
