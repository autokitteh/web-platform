import { DeploymentStateVariant } from "@enums";

export interface DeploymentStatusBadgeProps {
	className?: string;
	deploymentStatus: DeploymentStateVariant;
}
