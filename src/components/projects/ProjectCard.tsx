interface ProjectCardProps {
  onAddProject: () => void;
  userName?: string;
}

const ProjectCard = ({ onAddProject, userName }: ProjectCardProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h2 className="text-xl font-bold">Dashboard</h2>
        <p className="text-slate-300">Welcome {userName}</p>
      </div>

      <button
        onClick={onAddProject}
        className="bg-slate-700 text-white px-3 py-2 rounded-md"
      >
        Add Project
      </button>
    </div>
  );
};

export default ProjectCard;
