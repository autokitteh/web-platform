import React from "react";
import { SessionState } from "@enums";
import i18n from "i18next";

export const SessionsTableState = ({ sessionState }: { sessionState: SessionState }) => {
	const sessionsTableStateStyle = {
		[SessionState.created]: "text-white",
		[SessionState.running]: "text-blue-500",
		[SessionState.stopped]: "text-yellow-500",
		[SessionState.error]: "text-red",
		[SessionState.completed]: "text-green-accent",
		[SessionState.unspecified]: "text-blue-500",
	};
	const sessionStateClass = sessionsTableStateStyle[sessionState];
	const status = i18n.t(`sessions.table.statuses.${SessionState[sessionState]}`, { ns: "deployments" });

	return (
		<div aria-label={status} className={sessionStateClass} role="status">
			{status}
		</div>
	);
};
