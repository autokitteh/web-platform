import { tourStepsHTMLIds } from "./tour.constants";
import { ProjectActionType } from "@src/types/components";

export const defaultProjectTab = "code";

export const projectTabs = [
	{ label: "Code & Assets", value: "code" },
	{ label: "Connections", value: "connections", id: tourStepsHTMLIds.projectConnectionsTab },
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

export const lintViolationRules = {
	E1: "Project size too large",
	E2: "Duplicate connection name",
	E3: "Duplicate trigger name",
	E4: "Bad `call` format",
	E5: "File not found",
	E6: "Syntax error",
	E7: "Missing handler",
	E8: "Nonexisting connection",
	E9: "Malformed name",

	W1: "Empty variable",
	W2: "No triggers defined",
};
