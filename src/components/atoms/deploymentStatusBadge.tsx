import React from "react";

import { DeploymentStatusBadgeProps } from "@interfaces/components";
import { DeploymentStateVariant } from "@src/enums";
import { cn } from "@utilities";

export const DeploymentStatusBadge = ({ className, deploymentStatus }: DeploymentStatusBadgeProps) => {
	const baseClass =
		"w-20 flex align-center justify-center font-fira-code rounded-md p-1 px-1.5 font-semibold tracking-widest capitalize";

	const badgeClass = cn(
		baseClass,
		{
			"border border-dashed border-gray-500 text-gray-500 text-10":
				deploymentStatus === DeploymentStateVariant.draining,
			"bg-black border border-white text-white text-10": deploymentStatus === DeploymentStateVariant.active,
			"bg-gray-1050 text-gray-500 text-10": deploymentStatus === DeploymentStateVariant.inactive,
		},
		className
	);

	const badgeText = DeploymentStateVariant[deploymentStatus];

	return <div className={badgeClass}>{badgeText}</div>;
};
