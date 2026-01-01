import { MyProjectsPopover } from "./myProjectsPopover";
import { NewProjectButton } from "./newProjectButton";
import { useProjectsMenu } from "./useProjectsMenu";
import { cn } from "@utilities";

interface ProjectsMenuProps {
	className?: string;
	isOpen?: boolean;
}

export const ProjectsMenu = ({ className, isOpen = false }: ProjectsMenuProps) => {
	const { handleNewProject, handleProjectSelect, projectId, sortedProjectsList, t } = useProjectsMenu();

	return (
		<nav aria-label="Main navigation" className={cn(className, "flex flex-col gap-4")}>
			<ul className="ml-0 flex flex-col gap-2">
				<NewProjectButton isOpen={isOpen} label={t("newProject")} onClick={handleNewProject} />
				<MyProjectsPopover
					activeProjectId={projectId}
					emptyListMessage={t("noProjectsFound")}
					isOpen={isOpen}
					label={t("myProjects")}
					onProjectSelect={handleProjectSelect}
					projects={sortedProjectsList}
				/>
			</ul>
		</nav>
	);
};
