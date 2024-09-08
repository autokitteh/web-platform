import React, { CSSProperties, memo } from "react";

import ReactTimeAgo from "react-time-ago";

import { ActivityState } from "@src/enums";
import { SessionActivity } from "@src/types/models";

import { Accordion } from "@components/molecules";
import { ActivityStatus } from "@components/organisms/deployments/sessions/activityStatus";

interface ActivityRowProps {
	data: { activities: SessionActivity[] };
	index: number;
	style: CSSProperties;
}

const areEqual = (prevProps: ActivityRowProps, nextProps: ActivityRowProps) => {
	return (
		prevProps.index === nextProps.index &&
		prevProps.data.activities[prevProps.index] === nextProps.data.activities[nextProps.index]
	);
};

export const ActivityRow = memo(({ data, index, style }: ActivityRowProps) => {
	const activity = data.activities[index];

	if (!activity) {
		return null;
	}

	return (
		<div style={style}>
			<Accordion
				className="mt-2 rounded-md bg-gray-1000 px-2 py-1"
				title={
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
				}
			>
				123
			</Accordion>
		</div>
	);
}, areEqual);

ActivityRow.displayName = "ActivityRow";
