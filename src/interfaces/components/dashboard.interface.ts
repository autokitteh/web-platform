import { NavigateFunction } from "react-router-dom";

import { DeploymentStateVariant } from "@enums";
import { DashboardProjectWithStats } from "@type/models";

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
	handelDeactivateDeployment: (deploymentId: string) => Promise<void>;
	navigate: NavigateFunction;
}
