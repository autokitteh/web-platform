import React, { memo } from "react";

import ReactTimeAgo from "react-time-ago";

import { ActivityState } from "@src/enums";
import { ActivityRowProps } from "@src/interfaces/components";

import { Button, IconSvg } from "@components/atoms";
import { ActivityStatus } from "@components/organisms/deployments/sessions/activityStatus";

import { PlusAccordionIcon } from "@assets/image/icons";

const areEqual = (prevProps: ActivityRowProps, nextProps: ActivityRowProps) => {
	return (
		prevProps.index === nextProps.index &&
		prevProps.data.activities[prevProps.index] === nextProps.data.activities[nextProps.index]
	);
};

export const ActivityRow = memo(({ data, index, setActivity, style }: ActivityRowProps) => {
	const activity = data.activities[index];

	if (!activity) {
		return null;
	}

	return (
		<Button
			className="group flex w-full cursor-pointer gap-2.5 p-0 text-white hover:bg-transparent"
			onClick={() => setActivity(activity)}
			style={style}
		>
			<IconSvg className="w-3.5 fill-gray-500 transition group-hover:fill-green-800" src={PlusAccordionIcon} />

			<div className="flex w-full gap-3">
				<div className="mt-0.5">{activity.startTime.toTimeString().split(" ")[0]}</div>

				<div>
					<div className="text-left font-bold">{activity.functionName}</div>

					<div className="flex items-center gap-1">
						<span>Status: {/* eslint-disable-next-line prettier/prettier */}</span>

						<ActivityStatus activityState={activity.status as ActivityState} />
						-
						<ReactTimeAgo
							date={
								activity.status === ("error" as keyof ActivityState) ||
								activity.status === ("completed" as keyof ActivityState)
									? activity.endTime!
									: activity.startTime
							}
							locale="en-US"
						/>
					</div>
				</div>
			</div>
		</Button>
	);
}, areEqual);

ActivityRow.displayName = "ActivityRow";
