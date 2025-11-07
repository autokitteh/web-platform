import { tourStepsHTMLIds } from "./tour.constants";
import { ProjectActionType } from "@src/types/components";

export const defaultProjectTab = "explorer";

export const projectTabs = [
	{ label: "Code & Assets", value: "explorer" },
	{ label: "Connections", value: "connections", id: tourStepsHTMLIds.projectConnections },
	{ label: "Triggers", value: "triggers" },
	{ label: "Variables", value: "variables" },
] as { id?: string; label: string; value: string }[];

export const defaultProjectFile = "program.py";
export const defaultOpenedProjectFile = "README.md";
export const defaultProjectDirectory = "new_project_program";
export const defaultProjectName = "NewKittenProject";

export const ProjectActions: Record<ProjectActionType, ProjectActionType> = {
	build: "build",
	deploy: "deploy",
	manualRun: "manualRun",
};
