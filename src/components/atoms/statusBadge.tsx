import React from "react";

import { DeploymentStatusBadgeProps } from "@interfaces/components";
import { DeploymentStateVariant } from "@src/enums";
import { cn } from "@utilities";

export const StatusBadge = ({ className, deploymentStatus }: DeploymentStatusBadgeProps) => {
	const baseClass = "flex items-center gap-2.5 font-medium capitalize text-gray-500 text-[10px] tracking-widest";

	const badgeClass = cn(
		baseClass,
		{
			"text-gray-750": deploymentStatus === DeploymentStateVariant.inactive,
		},
		className
	);
	const circleClass = cn("size-3.5 rounded-full relative flex-shrink-0", {
		"border-2 border-gray-500 before:absolute  before:rounded-b-lg before:h-1/2 before:bottom-0 before:left-0 before:w-full before:bg-gray-500":
			deploymentStatus === DeploymentStateVariant.draining,
		"bg-gray-500": deploymentStatus === DeploymentStateVariant.active,
		"border-2 border-gray-750": deploymentStatus === DeploymentStateVariant.inactive,
	});

	const badgeText = DeploymentStateVariant[deploymentStatus];

	return (
		<div aria-label={badgeText} className={badgeClass} title={badgeText}>
			<div className={circleClass} />
			{badgeText}
		</div>
	);
};
