import React from "react";

import { t } from "i18next";

import { ActivityState } from "@enums";
import { cn } from "@src/utilities";

export const ActivityStatus = ({ activityState, className }: { activityState: ActivityState; className?: string }) => {
	const activitiesStateStyle = {
		[ActivityState.completed]: "text-green-800",
		[ActivityState.created]: "text-white",
		[ActivityState.error]: "text-red",
		[ActivityState.running]: "text-blue-500",
	};
	const sessionStateClass = cn("text-sm", activitiesStateStyle[activityState], className);
	const status = t(`activities.statuses.${ActivityState[activityState]}`, { ns: "deployments" });

	return (
		<div aria-label={status} className={sessionStateClass} role="status">
			{status}
		</div>
	);
};
