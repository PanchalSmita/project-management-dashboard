import type { Project } from "../../types";
import ProjectItem from "./ProjectItem";

interface ProjectListProps {
  projects: Project[];
}

const ProjectList = ({ projects }: ProjectListProps) => {
  return (
    <ul className="flex gap-2.5 flex-wrap">
      {projects.map((project) => (
        <ProjectItem key={project.id} project={project} />
      ))}
    </ul>
  );
};

export default ProjectList;
