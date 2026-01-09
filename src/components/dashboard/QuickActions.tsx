import { FiPlus, FiUsers, FiSettings, FiActivity } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface QuickActionsProps {
  onCreateProject: () => void;
  userRole: string;
}

const QuickActions = ({ onCreateProject, userRole }: QuickActionsProps) => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: FiPlus,
      label: "New Project",
      description: "Create a new project",
      onClick: onCreateProject,
      color: "cyan",
      show: true,
    },
    {
      icon: FiActivity,
      label: "View Boards",
      description: "Manage your tasks",
      onClick: () => navigate("/board"),
      color: "green",
      show: true,
    },
    {
      icon: FiUsers,
      label: "Team Management",
      description: "Manage team members",
      onClick: () => navigate("/users"),
      color: "purple",
      show: userRole === "ADMIN",
    },
    {
      icon: FiSettings,
      label: "Settings",
      description: "Configure preferences",
      onClick: () => console.log("Settings clicked"),
      color: "orange",
      show: true,
    },
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions
          .filter((action) => action.show)
          .map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`group relative bg-gradient-to-br from-${action.color}-500/10 to-${action.color}-600/10 border border-${action.color}-500/30 rounded-xl p-4 text-left transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-${action.color}-500/20`}
              >
                <div className={`w-12 h-12 bg-${action.color}-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className={`text-${action.color}-400 text-xl`} />
                </div>
                <h4 className="text-white font-semibold mb-1">{action.label}</h4>
                <p className="text-xs text-gray-500">{action.description}</p>
                
                {/* Hover effect */}
                <div className={`absolute inset-0 bg-${action.color}-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default QuickActions;