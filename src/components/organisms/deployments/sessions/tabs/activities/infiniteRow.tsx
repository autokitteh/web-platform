import React, { memo, useCallback } from "react";

import { useTranslation } from "react-i18next";
import ReactTimeAgo from "react-time-ago";

import { ActivityState } from "@enums";
import { ActivityRowProps } from "@interfaces/components";

import { IconSvg } from "@components/atoms";
import { ActivityStatus } from "@components/organisms/deployments/sessions/activityStatus";

import { PlusAccordionIcon } from "@assets/image/icons";

const ActivityRow = memo(({ data: activity, setActivity, style }: ActivityRowProps) => {
	const { t } = useTranslation("deployments", { keyPrefix: "activities.row" });

	if (!activity) {
		return null;
	}

	const { endTime, functionName, startTime, status } = activity;
	const displayTime = startTime.toTimeString().split(" ")[0];
	const isFinished =
		(status as keyof typeof ActivityState) === ActivityState.error ||
		(status as keyof typeof ActivityState) === ActivityState.completed;
	const activityTime = isFinished ? endTime! : startTime;

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const handleClick = useCallback(() => setActivity(activity), [activity, setActivity]);
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			if (event.key === "Enter" || event.key === " ") {
				setActivity(activity);
			}
		},
		[activity, setActivity]
	);

	return (
		<div
			className="scrollbar group flex w-full cursor-pointer gap-2.5 overflow-x-auto p-2 text-white hover:bg-gray-700"
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			role="button"
			style={style}
			tabIndex={0}
		>
			<IconSvg
				className="mt-1 w-3.5 fill-gray-500 transition group-hover:fill-green-800"
				src={PlusAccordionIcon}
			/>

			<div className="flex w-full gap-3">
				<div className="mt-0.5">{displayTime}</div>

				<div>
					<div className="text-left font-bold">
						{t("functionName")}: {functionName}
					</div>

					<div className="flex items-center gap-1">
						<span>Status:</span>
						<ActivityStatus activityState={ActivityState[status as keyof typeof ActivityState]} />
						-
						<ReactTimeAgo date={activityTime} locale="en-US" />
					</div>
				</div>
			</div>
		</div>
	);
});

ActivityRow.displayName = "ActivityRow";

export { ActivityRow };
