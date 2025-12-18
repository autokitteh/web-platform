import { KeyboardEvent, MouseEvent } from "react";

import { DeploymentStateVariant, SessionStateType } from "@enums";

export interface ProjectsTableMeta {
	isLoadingStats: (projectId: string) => boolean;
	hasLoadError: (projectId: string) => boolean;
	onDeactivate: (deploymentId: string) => Promise<void>;
	onExport: (projectId: string) => void;
	onDelete: (status: DeploymentStateVariant, deploymentId: string, projectId: string, name: string) => void;
	onSessionClick: (
		event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
		projectId: string,
		sessionState: keyof typeof SessionStateType
	) => void;
}
