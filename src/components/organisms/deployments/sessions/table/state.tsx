import React from "react";

import { t } from "i18next";

import { sessionStatusTextClasses } from "@constants";
import { SessionState } from "@enums";
import { cn } from "@src/utilities";

export const SessionsTableState = ({ className, sessionState }: { className?: string; sessionState: SessionState }) => {
	const stateKey = SessionState[sessionState] as keyof typeof sessionStatusTextClasses;
	const sessionStateClass = cn("text-sm", sessionStatusTextClasses[stateKey], className);
	const status = t(`sessions.table.statuses.${stateKey}`, { ns: "deployments" });

	return (
		<div aria-label={status} className={sessionStateClass} role="status">
			{status}
		</div>
	);
};
