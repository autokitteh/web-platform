import React from "react";

import { t } from "i18next";

import { SessionState } from "@enums";
import { cn } from "@utilities";

export const SessionsTableState = ({ className, sessionState }: { className?: string; sessionState: SessionState }) => {
	const sessionsTableStateStyle = {
		[SessionState.completed]: "text-green-800",
		[SessionState.created]: "text-white",
		[SessionState.error]: "text-error",
		[SessionState.running]: "text-blue-500",
		[SessionState.stopped]: "text-yellow-500",
		[SessionState.unspecified]: "text-blue-500",
	};
	const sessionStateClass = cn("text-sm", sessionsTableStateStyle[sessionState], className);
	const status = t(`sessions.table.statuses.${SessionState[sessionState]}`, { ns: "deployments" });

	return (
		<div aria-label={status} className={sessionStateClass} role="status">
			{status}
		</div>
	);
};
