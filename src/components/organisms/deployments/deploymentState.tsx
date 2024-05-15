import React, { ReactNode } from "react";
import { DeploymentStateVariant } from "@enums";
import { cn } from "@utilities";
import i18n from "i18next";

export const DeploymentState = ({ deploymentState }: { deploymentState: DeploymentStateVariant }): ReactNode => {
	switch (deploymentState) {
		case DeploymentStateVariant.activeDeployment:
			return (
				<div
					aria-label={i18n.t("history.table.statuses.active", { ns: "deployments" })}
					className="text-xs text-center text-white bg-gray-800 rounded py-1 px-1.5 font-semibold border min-w-14"
					role="status"
				>
					{i18n.t("history.table.statuses.active", { ns: "deployments" })}
				</div>
			);
		case DeploymentStateVariant.inactiveDeployment:
			return (
				<div
					aria-label={i18n.t("history.table.statuses.inactive", { ns: "deployments" })}
					className="text-xs text-center text-gray-400 bg-gray-600 rounded py-1 px-1.5 font-semibold min-w-14"
					role="status"
				>
					{i18n.t("history.table.statuses.inactive", { ns: "deployments" })}
				</div>
			);
		case DeploymentStateVariant.testingDeployment:
			return (
				<div
					aria-label={i18n.t("history.table.statuses.testing", { ns: "deployments" })}
					className="text-xs text-center"
					role="status"
				>
					{i18n.t("history.table.statuses.testing", { ns: "deployments" })}
				</div>
			);
		case DeploymentStateVariant.drainingDeployment:
			return (
				<div
					aria-label={i18n.t("history.table.statuses.draining", { ns: "deployments" })}
					className={cn(
						"text-xs text-center text-gray-300 rounded py-1 px-1.5 font-semibold min-w-14 border border-dashed"
					)}
					role="status"
				>
					{i18n.t("history.table.statuses.draining", { ns: "deployments" })}
				</div>
			);
		default:
			return (
				<div
					aria-label={i18n.t("history.table.statuses.unspecified", { ns: "deployments" })}
					className="text-xs text-center"
					role="status"
				>
					{i18n.t("history.table.statuses.unspecified", { ns: "deployments" })}
				</div>
			);
	}
};
