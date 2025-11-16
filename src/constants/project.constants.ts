import { ProjectActionType } from "@src/types/components";

export const defaultProjectTab = "explorer";

export const defaultProjectFile = "program.py";
export const defaultOpenedProjectFile = "README.md";
export const defaultProjectDirectory = "new_project_program";
export const defaultProjectName = "NewKittenProject";

export const ProjectActions: Record<ProjectActionType, ProjectActionType> = {
	build: "build",
	deploy: "deploy",
	manualRun: "manualRun",
};
