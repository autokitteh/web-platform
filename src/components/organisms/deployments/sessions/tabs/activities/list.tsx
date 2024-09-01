import React, { useEffect } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { useParams } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";

import { SessionsService } from "@services/sessions.service";
import { convertSessionLogRecordsProtoToActivitiesModel } from "@src/models";
import { useToastStore } from "@src/store";

import { IconSvg, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { Accordion } from "@components/molecules";
import { ActivityStatus } from "@components/organisms/deployments/sessions/activityStatus";

import { ArrowUpFaIcon } from "@assets/image/icons";

export const SessionActivitiesList = () => {
	const { sessionId } = useParams();
	const [activities, setActivities] = React.useState<any[]>([]);
	const addToast = useToastStore((state) => state.addToast);

	const fetchActivities = async () => {
		const { data: sessionExecution, error } = await SessionsService.getLogRecordsBySessionId(sessionId!);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
			});
		}
		const sessionExecutionConverted = convertSessionLogRecordsProtoToActivitiesModel(sessionExecution!.records);
		setActivities(sessionExecutionConverted || []);
	};

	useEffect(() => {
		fetchActivities();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="h-full overflow-y-scroll pt-5">
			{(activities || []).map((activity, index) => (
				<div key={activity.key}>
					{index !== 0 ? (
						<div className="flex w-full items-center justify-center pt-2">
							<IconSvg className="fill-white" size="sm" src={ArrowUpFaIcon} />
						</div>
					) : null}

					<div className="mt-2">
						<Accordion
							className="mt-2 rounded-md bg-gray-1000 px-2 py-1"
							title={
								<div className="flex w-full gap-3">
									<div className="mt-0.5">{activity.startTime.toTimeString().split(" ")[0]}</div>

									<div>
										<div className="text-left font-bold"> {activity.functionName}</div>

										<div className="flex items-center gap-1">
											<span>Status: </span>

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
								{activity.args.length ? (
									<>
										<div className="font-bold">Arguments:</div>
										<Table>
											<THead>
												<Tr>
													<Th>Value</Th>
												</Tr>
											</THead>

											<TBody>
												{activity.args.map((argument: string) => (
													<Tr key={argument}>
														<Td>{argument}</Td>
													</Tr>
												))}
											</TBody>
										</Table>
									</>
								) : null}

								{activity.kwargs.length ? (
									<>
										<div className="mt-4 font-bold">KW Arguments:</div>
										<Table>
											<THead>
												<Tr>
													<Th>Key</Th>

													<Th>Value</Th>
												</Tr>
											</THead>

											<TBody>
												{activity.kwargs.map((argument: { key: string; value: any }) => (
													<Tr key={argument.key}>
														<Td>{argument.key}</Td>

														<Td>{argument.value}</Td>
													</Tr>
												))}
											</TBody>
										</Table>
									</>
								) : null}

								{activity.returnValue ? (
									<Accordion
										className="mt-2"
										title={<div className="font-bold underline">Returned Value</div>}
									>
										<JsonView
											className="scrollbar max-h-72 overflow-auto"
											style={githubDarkTheme}
											value={activity.returnValue}
										/>
									</Accordion>
								) : null}
							</div>
						</Accordion>
					</div>
				</div>
			))}
		</div>
	);
};
