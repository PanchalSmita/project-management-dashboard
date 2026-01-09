import AppRoutes from "./routes/AppRoutes";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import Modal from "./components/common/Modal";
import { useProjects } from "./hooks/useProjects";
import { useAuth } from "./hooks/useAuth";
import { MainLayout } from "./components/layout/MainLayout";

const App = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { createProject } = useProjects();
  
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectName, setProjectName] = useState("");

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    
    const result = await createProject({
      name: projectName.trim(),
    });
    
    if (result.success) {
      setProjectName("");
      setShowProjectModal(false);
    }
  };

  const isLoginPage = location.pathname === "/login" || location.pathname === "/signup";

  if (isLoginPage || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppRoutes />
      </div>
    );
  }

  return (
    <MainLayout>
      <AppRoutes />
      
      {/* Project Modal - Global access if needed, though Dashboard has its own now */}
      {showProjectModal && (
        <Modal>
          <div className="w-[420px] p-4 bg-card rounded-lg border border-border text-foreground">
            <h3 className="m-0 mb-4 text-lg font-semibold">Create Project</h3>
            <input
              placeholder="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-2 mb-4 rounded-md border border-input bg-background"
            />
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setShowProjectModal(false)} 
                className="px-4 py-2 rounded-md hover:bg-secondary transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateProject} 
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition"
              >
                Create
              </button>
            </div>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
};

export default App;