import { DeploymentStateVariant } from "@src/enums";

export interface DeploymentStatusBadgeProps {
	className?: string;
	deploymentStatus: DeploymentStateVariant;
}
