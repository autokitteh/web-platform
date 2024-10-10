import React from "react";

import i18n from "i18next";

import { SessionState } from "@enums";
import { cn } from "@src/utilities";

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
	const status = i18n.t(`sessions.table.statuses.${SessionState[sessionState]}`, { ns: "deployments" });

	return (
		<div aria-label={status} className={sessionStateClass} role="status">
			{status}
		</div>
	);
};
