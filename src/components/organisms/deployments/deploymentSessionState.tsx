import React from "react";
import { SessionState } from "@enums";
import i18n from "i18next";

const deploymentSessionStateStyles = {
	[SessionState.created]: "text-white",
	[SessionState.running]: "text-blue-500",
	[SessionState.stopped]: "text-yellow-500",
	[SessionState.error]: "text-red",
	[SessionState.completed]: "text-green-accent",
	[SessionState.unspecified]: "text-blue-500",
};

export const DeploymentSessionState = ({ sessionState }: { sessionState: SessionState }) => {
	const baseClass = deploymentSessionStateStyles[sessionState];

	const status = i18n.t(`sessions.table.statuses.${SessionState[sessionState]}`, { ns: "deployments" });

	return (
		<div aria-label={status} className={baseClass} role="status">
			{status}
		</div>
	);
};
