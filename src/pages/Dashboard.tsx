import { useState, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProjects } from "../hooks/useProjects";
import { useTasks } from "../hooks/useTasks";
import { useNotifications } from "../hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { 
  FiSearch, 
  FiPlus, 
  FiUsers, 
  FiTrendingUp,
  FiFolder,
  FiChevronRight,
  FiBarChart2,
  FiEdit2,
  FiTrash2
} from "react-icons/fi";
import type { Project } from "../types";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    projects, 
    createProject, 
    updateProject,
    deleteProject,
    selectProject, 
    isLoading 
  } = useProjects();
  const { getTasksByProject } = useTasks();
  const { success, error } = useNotifications();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = useMemo(() => {
    if (!projects || !Array.isArray(projects)) return [];
    return projects.filter((project) =>
      project?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  const getProjectStatus = (projectId: string) => {
    const projectTasks = getTasksByProject(projectId);
    const totalTasks = projectTasks.length;

    if (totalTasks === 0) return "Not Started";

    const completedTasks = projectTasks.filter(t => t?.boardId === "done").length;
    const todoTasks = projectTasks.filter(t => t?.boardId === "todo").length;

    if (completedTasks === totalTasks) return "Completed";
    if (todoTasks < totalTasks) return "In Process";

    return "Not Started";
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      error("Project name is required");
      return;
    }

    let result;
    
    if (editingProjectId) {
      result = await updateProject(editingProjectId, {
        name: projectName.trim(),
        description: projectDesc.trim() || undefined,
      });
    } else {
      result = await createProject({
        name: projectName.trim(),
        description: projectDesc.trim() || undefined,
      });
    }

    if (result.success) {
      success(editingProjectId ? "Project updated successfully!" : "Project created successfully!");
      setProjectName("");
      setProjectDesc("");
      setEditingProjectId(null);
      setIsModalOpen(false);
    }
  };

  const openNewProjectModal = () => {
    setEditingProjectId(null);
    setProjectName("");
    setProjectDesc("");
    setIsModalOpen(true);
  };

  const handleProjectClick = (project: Project) => {
    selectProject(project.id);
    navigate(`/board?projectId=${project.id}`);
  };

  const dashboardStats = useMemo(() => {
    const totalProjects = projects?.length || 0;
    const totalTasks = projects?.reduce((acc, project) => acc + getTasksByProject(project.id).length, 0) || 0;
    const completedProjects = projects?.filter(project => {
      const projectTasks = getTasksByProject(project.id);
      if (projectTasks.length === 0) return false;
      return projectTasks.every(task => task?.boardId === "done");
    }).length || 0;
    const activeProjects = totalProjects - completedProjects;

    return { totalProjects, activeProjects, completedProjects, totalTasks };
  }, [projects, getTasksByProject]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Fixed Top Section: Header & Stats */}
      <div className="flex-none p-8 pb-2 space-y-6">
        <header className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {user?.name || "John"}! Here's what's happening.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 bg-secondary/50 border border-transparent rounded-md text-sm focus:bg-background focus:border-ring focus:ring-1 focus:ring-ring outline-none transition-all"
            />
          </div>
          <button
            onClick={openNewProjectModal}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Projects" value={dashboardStats.totalProjects} icon={<FiFolder />} />
          <StatCard label="Active Projects" value={dashboardStats.activeProjects} icon={<FiTrendingUp />} />
          <StatCard label="Total Tasks" value={dashboardStats.totalTasks} icon={<FiBarChart2 />} />
          <StatCard 
            label="Team Members" 
            value={projects?.reduce((acc, project) => acc + (project.members?.length || 0), 0) || 0} 
            icon={<FiUsers />} 
          />
        </div>

        <div className="flex items-center justify-between pt-2">
            <h2 className="text-lg font-semibold tracking-tight">Recent Projects</h2>
        </div>
      </div>

      {/* Scrollable Projects List */}
      <div className="flex-1 overflow-y-auto min-h-0 p-8 pt-2">
        <div className="space-y-4">

          {filteredProjects.length > 0 ? (
            <div className="grid gap-4">
              {filteredProjects.map((project) => {
              const status = getProjectStatus(project.id);
              const taskCount = getTasksByProject(project.id).length;
              return (
              <div 
                key={project.id} 
                className="group flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div 
                  className="flex items-center gap-4 cursor-pointer flex-1"
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="w-10 h-10 bg-secondary rounded-md flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <FiFolder className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium group-hover:text-primary transition-colors">{project.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{project.description || "No description provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity mr-4">
                    <button 
                        title="Edit Project"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingProjectId(project.id);
                            setProjectName(project.name);
                            setProjectDesc(project.description || "");
                            setIsModalOpen(true); 
                        }}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md"
                    >
                        <FiEdit2 size={16} />
                    </button>
                    <button 
                        title="Delete Project"
                        onClick={(e) => {
                            e.stopPropagation();
                            if(confirm("Are you sure you want to delete this project?")) {
                                deleteProject(project.id);
                            }
                        }}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                    >
                        <FiTrash2 size={16} />
                    </button>
                  </div>

                  <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground text-right">
                    <span className="w-20">{taskCount} tasks</span>
                    <span className="w-24">{project.members?.length || 0} members</span>
                  </div>
                  <StatusBadge status={status} />
                  <FiChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <EmptyState searchTerm={searchTerm} onAction={openNewProjectModal} />
        )}
      </div>
    </div>

      {/* Modal is rendered outside Main content usually, but here is fine */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-lg border border-border shadow-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{editingProjectId ? "Edit Project" : "Create New Project"}</h2>
              <p className="text-sm text-muted-foreground">{editingProjectId ? "Update your project details." : "Add a new project to your workspace."}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1.5"
                  placeholder="e.g. Website Redesign"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Description
                </label>
                <textarea
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1.5 resize-none"
                  placeholder="Describe your project..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProject}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Saving..." : (editingProjectId ? "Save Changes" : "Create Project")}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponents for cleaner code


const StatCard = ({ label, value, icon }: { label: string, value: number, icon: any }) => (
  <div className="bg-card border border-border rounded-lg p-5 shadow-xs">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
      </div>
      <div className="w-8 h-8 bg-secondary rounded-md flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    "Completed": "bg-green-500/15 text-green-600 dark:text-green-400",
    "In Process": "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    "Not Started": "bg-secondary text-muted-foreground"
  };
  
  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles] || styles["Not Started"]}`}>
      {status}
    </span>
  );
};

const EmptyState = ({ searchTerm, onAction }: { searchTerm: string, onAction: () => void }) => (
  <div className="text-center py-12 border border-dashed border-border rounded-lg bg-secondary/20">
    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3 text-muted-foreground">
      <FiFolder className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-medium text-foreground mb-1">
      {searchTerm ? "No projects found" : "No projects yet"}
    </h3>
    <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
      {searchTerm 
        ? "Try adjusting your search terms" 
        : "Get started by creating your first project and managing your tasks."}
    </p>
    {!searchTerm && (
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
      >
        <FiPlus className="w-4 h-4" />
        Create Project
      </button>
    )}
  </div>
);

export default Dashboard;