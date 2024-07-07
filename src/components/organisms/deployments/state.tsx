import React from "react";

import { DeploymentStateVariant } from "@enums";
import { cn } from "@utilities";
import i18n from "i18next";

const deploymentStateStyles = {
	[DeploymentStateVariant.active]: "text-white bg-gray-800 border",
	[DeploymentStateVariant.inactive]: "text-gray-400 bg-gray-600",
	[DeploymentStateVariant.draining]: "text-gray-300 border border-dashed",
	[DeploymentStateVariant.testing]: "",
};

export const DeploymentState = ({ deploymentState }: { deploymentState: DeploymentStateVariant }) => {
	const baseClass = cn(
		"text-xs text-center rounded py-1 px-1.5 font-semibold min-w-14",
		deploymentStateStyles[deploymentState as keyof typeof deploymentStateStyles]
	);

	const statusKey = DeploymentStateVariant[deploymentState];
	const status = i18n.t(`history.table.statuses.${statusKey}`, { ns: "deployments" });

	return (
		<div aria-label={status} className={baseClass} role="status">
			{status}
		</div>
	);
};
