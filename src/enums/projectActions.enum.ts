import { ProjectActionType } from "@src/types/components";

export const ProjectActions: Record<ProjectActionType, ProjectActionType> = {
	build: "build",
	deploy: "deploy",
	manualRun: "manualRun",
};
