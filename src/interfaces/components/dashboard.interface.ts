import { NavigateFunction } from "react-router-dom";

import { DeploymentStateVariant } from "@src/enums";
import { DashboardProjectWithStats } from "@src/types/models";

export interface WelcomeVideoCardProps {
	description?: string;
	title: React.ReactNode;
	onPlay?: () => void;
	image: string;
}

export interface DashboardProjectsTableRowProps extends DashboardProjectWithStats {
	displayDeleteModal: (
		status: DeploymentStateVariant,
		deploymentId: string,
		projectId: string,
		projectName: string
	) => void;
	downloadProjectExport: (projectId: string) => void;
	handleDeactivateDeployment: (deploymentId: string) => Promise<void>;
	navigate: NavigateFunction;
}
