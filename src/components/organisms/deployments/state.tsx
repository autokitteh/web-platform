import React from "react";

import i18n from "i18next";

import { DeploymentStateVariant } from "@enums";
import { cn } from "@utilities";

const deploymentStateStyles = {
	[DeploymentStateVariant.active]: "text-white bg-gray-800 border",
	[DeploymentStateVariant.draining]: "text-gray-300 border border-dashed",
	[DeploymentStateVariant.inactive]: "text-gray-400 bg-gray-600",
	[DeploymentStateVariant.testing]: "",
};

export const DeploymentState = ({
	className,
	deploymentState,
}: {
	className?: string;
	deploymentState: DeploymentStateVariant;
}) => {
	const baseClass = cn(
		"w-fit min-w-14 rounded px-1.5 py-1 text-center text-xs font-semibold",
		deploymentStateStyles[deploymentState as keyof typeof deploymentStateStyles],
		className
	);

	const statusKey = DeploymentStateVariant[deploymentState];
	const status = i18n.t(`history.table.statuses.${statusKey}`, { ns: "deployments" });

	return (
		<div aria-label={status} className={baseClass} role="status">
			{status}
		</div>
	);
};
