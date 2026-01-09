import { FiFolder } from "react-icons/fi";
import type { Project } from "../../types";

interface ProjectItemProps {
  project: Project;
}

const ProjectItem = ({ project }: ProjectItemProps) => {
  return (
    <li className="bg-[#2a2a2a] border border-white/10 rounded-lg p-4 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <FiFolder className="text-cyan-400 text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{project.name}</h3>
          <p className="text-xs text-gray-500">Project ID: {project.id}</p>
        </div>
      </div>
    </li>
  );
};

export default ProjectItem;