import React from "react";

import { t } from "i18next";

import { DeploymentStateVariant } from "@enums";
import { DeploymentStatusBadgeProps } from "@interfaces/components";
import { cn } from "@utilities";

export const StatusBadge = ({ className, deploymentStatus }: DeploymentStatusBadgeProps) => {
	const baseClass = "flex items-center gap-2.5 capitalize text-gray-50";

	const badgeClass = cn(
		baseClass,
		{
			"text-gray-750": deploymentStatus === DeploymentStateVariant.inactive,
		},
		className
	);
	const circleClass = cn("relative mb-0.5 size-3 shrink-0 rounded-full", {
		"border-2 border-gray-500 before:absolute  before:rounded-b-lg before:h-1/2 before:bottom-0 before:left-0 before:w-full before:bg-gray-500":
			deploymentStatus === DeploymentStateVariant.draining,
		"bg-gray-500": deploymentStatus === DeploymentStateVariant.active,
		"border-2 border-gray-750": deploymentStatus === DeploymentStateVariant.inactive,
	});

	const statusKey = DeploymentStateVariant[deploymentStatus];
	const status = t(`history.table.statuses.${statusKey}`, { ns: "deployments" });

	return (
		<div aria-label={status} className={badgeClass} role="status" title={status}>
			<div className={circleClass} />
			{status}
		</div>
	);
};
