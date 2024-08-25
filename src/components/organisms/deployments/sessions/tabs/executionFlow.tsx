import React, { useEffect } from "react";

import JsonView from "@uiw/react-json-view";
import { vscodeTheme } from "@uiw/react-json-view/vscode";
import { useParams } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";

import { SessionsService } from "@services/sessions.service";

import { Accordion } from "@components/molecules";
import { ActivityStatus } from "@components/organisms/deployments/sessions/activityStatus";

const example = {
	string: "Lorem ipsum dolor sit amet",
	integer: 42,
	float: 114.514,
	bigint: 10086n,
	null: null,
	undefined,
	timer: 0,
	date: new Date("Tue Sep 13 2022 14:07:44 GMT-0500 (Central Daylight Time)"),
	array: [19, 100.86, "test", NaN, Infinity],
	nestedArray: [
		[1, 2],
		[3, 4],
	],
	object: {
		"first-child": true,
		"second-child": false,
		"last-child": null,
	},
	string_number: "1234",
};

export const SessionExecutionFlow = () => {
	const { sessionId } = useParams();
	const [activities, setActivities] = React.useState<any[]>([]);
	const [openActivities, setOpenActivities] = React.useState<string[]>([]);

	useEffect(() => {
		(async () => {
			const { data: sessionExecution, error } = await SessionsService.getSessionActivitiesBySessionId(sessionId!);
			setActivities(sessionExecution || []);
		})();
	}, [sessionId]);

	return (activities || []).map((activity) => (
		<div className="mt-2" key={activity.key}>
			<Accordion
				className="mt-2 rounded-md bg-gray-1000 px-2 py-1"
				title={
					<div className="flex w-full gap-3">
						<div className="mt-0.5">{activity.startTime.toTimeString().split(" ")[0]}</div>

						<div>
							<div className="text-left font-bold"> {activity.functionName}</div>

							<div className="flex items-center gap-1">
								Status:{" "}

								{activity.status === "error" || activity.status === "completed" ? (
									<>
										<ActivityStatus activityState={activity.status} /> -
										<ReactTimeAgo date={activity.endTime} locale="en-US" />
									</>
								) : (
									<>
										<ActivityStatus activityState={activity.status} /> -
										<ReactTimeAgo date={activity.startTime} locale="en-US" />
									</>
								)}
							</div>
						</div>
					</div>
				}
			>
				<div className="mx-7">
					<div className="font-bold">Params:</div>

					{activity.parameters
						? Object.keys(activity.parameters).map((parameter) => (
								<div key={parameter}>
									{parameter}: {activity.parameters[parameter]}
								</div>
							))
						: null}

					{activity.returnValue ? (
						<Accordion className="mt-2" title={<div className="font-bold underline">Returned Value</div>}>
							<JsonView
								className="scrollbar max-h-72 overflow-auto"
								style={vscodeTheme}
								value={activity.returnValue}
							/>
						</Accordion>
					) : null}
				</div>
			</Accordion>
		</div>
	));
};
