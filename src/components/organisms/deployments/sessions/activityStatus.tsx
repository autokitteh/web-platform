import React from "react";

import { t } from "i18next";

import { ActivityState, sessionStatusTextClasses } from "@constants";
import { cn } from "@src/utilities";
import { ActivityStateType } from "@type/models";

export const ActivityStatus = ({
	activityState,
	className,
}: {
	activityState: ActivityStateType;
	className?: string;
}) => {
	const sessionStateClass = cn("text-sm", sessionStatusTextClasses[activityState], className);
	const status = t(`activities.statuses.${ActivityState[activityState]}`, { ns: "deployments" });

	return (
		<div aria-label={status} className={sessionStateClass} role="status">
			{status}
		</div>
	);
};
