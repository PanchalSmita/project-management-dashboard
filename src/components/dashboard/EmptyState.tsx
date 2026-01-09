import { FiFolder, FiPlus } from "react-icons/fi";

interface EmptyStateProps {
  onCreateProject: () => void;
}

const EmptyState = ({ onCreateProject }: EmptyStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
            <FiFolder className="text-cyan-400 text-6xl" />
          </div>
          
          {/* Floating decorative elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Text Content */}
        <h3 className="text-2xl font-bold text-white mb-3">No Projects Yet</h3>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Get started by creating your first project. Organize your tasks, collaborate with your team, and track progress all in one place.
        </p>

        {/* CTA Button */}
        <button
          onClick={onCreateProject}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/50"
        >
          <FiPlus size={20} />
          Create Your First Project
        </button>

        {/* Additional Info */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-cyan-400 text-2xl mb-2">📋</div>
            <h4 className="text-white font-semibold mb-1">Organize Tasks</h4>
            <p className="text-xs text-gray-500">Keep your work structured with boards and tasks</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-cyan-400 text-2xl mb-2">👥</div>
            <h4 className="text-white font-semibold mb-1">Collaborate</h4>
            <p className="text-xs text-gray-500">Work together with your team in real-time</p>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="text-cyan-400 text-2xl mb-2">📊</div>
            <h4 className="text-white font-semibold mb-1">Track Progress</h4>
            <p className="text-xs text-gray-500">Monitor your project status and completion</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;