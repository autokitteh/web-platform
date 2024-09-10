import React, { memo } from "react";

import ReactTimeAgo from "react-time-ago";

import { ActivityState } from "@src/enums";
import { ActivityRowProps } from "@src/interfaces/components";

import { IconSvg } from "@components/atoms";
import { ActivityStatus } from "@components/organisms/deployments/sessions/activityStatus";

import { PlusAccordionIcon } from "@assets/image/icons";

const areEqual = (prevProps: ActivityRowProps, nextProps: ActivityRowProps) => {
	return prevProps.index === nextProps.index && prevProps.data === nextProps.data;
};

export const ActivityRow = memo(({ data: activity, setActivity, style }: ActivityRowProps) => {
	if (!activity) {
		return null;
	}
	const { endTime, functionName, startTime, status } = activity;
	const displayTime = startTime.toTimeString().split(" ")[0];
	const isFinished = (status as ActivityState) === "error" || (status as ActivityState) === "completed";
	const activityTime = isFinished ? endTime! : startTime;

	return (
		<div
			className="group flex w-full cursor-pointer gap-2.5 p-0 text-white hover:bg-transparent"
			onClick={() => setActivity(activity)}
			onKeyDown={() => setActivity(activity)}
			role="button"
			style={style}
			tabIndex={0}
		>
			<IconSvg className="w-3.5 fill-gray-500 transition group-hover:fill-green-800" src={PlusAccordionIcon} />

			<div className="flex w-full gap-3">
				<div className="mt-0.5">{displayTime}</div>

				<div>
					<div className="text-left font-bold">{functionName}</div>

					<div className="flex items-center gap-1">
						<span>Status: {/* eslint-disable-next-line prettier/prettier */}</span>

						<ActivityStatus activityState={status as ActivityState} />
						-
						<ReactTimeAgo date={activityTime} locale="en-US" />
					</div>
				</div>
			</div>
		</div>
	);
}, areEqual);

ActivityRow.displayName = "ActivityRow";
