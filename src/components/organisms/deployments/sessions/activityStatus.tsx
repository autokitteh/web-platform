import React from "react";

import { t } from "i18next";

import { ActivityState } from "@constants";
import { cn } from "@src/utilities";
import { ActivityStateType } from "@type/models";

export const ActivityStatus = ({
	activityState,
	className,
}: {
	activityState: ActivityStateType;
	className?: string;
}) => {
	const activitiesStateStyle: Record<ActivityStateType, string> = {
		[ActivityState.completed]: "text-green-800",
		[ActivityState.created]: "text-white",
		[ActivityState.error]: "text-red",
		[ActivityState.running]: "text-blue-500",
		[ActivityState.stopped]: "text-gray-300",
		[ActivityState.unspecified]: "text-red",
	};
	const sessionStateClass = cn("text-sm", activitiesStateStyle[activityState], className);
	const status = t(`activities.statuses.${ActivityState[activityState]}`, { ns: "deployments" });

	return (
		<div aria-label={status} className={sessionStateClass} role="status">
			{status}
		</div>
	);
};
