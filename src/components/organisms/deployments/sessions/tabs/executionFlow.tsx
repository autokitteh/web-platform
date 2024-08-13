import React, { useEffect } from "react";

import Editor, { Monaco } from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";

import { SessionsService } from "@services/sessions.service";
import { sessionsEditorLineHeight } from "@src/constants";
import { useToastStore } from "@src/store";

import { IconSvg, Loader } from "@components/atoms";
import { Accordion } from "@components/molecules";
import { ActivityStatus } from "@components/organisms/deployments/sessions/activityStatus";

import { ArrowUpFaIcon } from "@assets/image/icons";

export const SessionExecutionFlow = () => {
	const { sessionId } = useParams();
	const [activities, setActivities] = React.useState<any[]>([]);
	const addToast = useToastStore((state) => state.addToast);

	const fetchActivities = async () => {
		const { data: sessionExecution, error } = await SessionsService.getSessionActivitiesBySessionId(sessionId!);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
			});
		}
		setActivities(sessionExecution || []);
	};

	useEffect(() => {
		fetchActivities();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleEditorWillMount = (monaco: Monaco) => {
		monaco.editor.defineTheme("sessionEditorTheme", {
			base: "vs-dark",
			colors: { "editor.background": "#000000" },
			rules: [{ token: "dateTime", foreground: "FFA500" }],
			inherit: true,
		});
	};

	return (
		<div className="pt-5">
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
								<div className="font-bold">Params:</div>

								{activity.parameters
									? Object.keys(activity.parameters).map((parameter) => (
											<div key={parameter}>
												<span>{parameter}: </span>

												<div className="inline font-semibold">
													{activity.parameters[parameter]}
												</div>
											</div>
										))
									: null}

								{activity.returnValue ? (
									<Accordion
										className="mt-2"
										title={<div className="font-bold underline">Returned Value</div>}
									>
										<Editor
											beforeMount={handleEditorWillMount}
											className="h-64"
											language="json"
											loading={<Loader isCenter size="lg" />}
											options={{
												lineHeight: sessionsEditorLineHeight,
												lineNumbers: "off",
												minimap: { enabled: false },
												readOnly: true,
												renderLineHighlight: "none",
												scrollBeyondLastLine: false,
												wordWrap: "on",
												contextmenu: false,
												theme: "vscode",
											}}
											theme="sessionEditorTheme"
											value={JSON.stringify(activity.returnValue, null, "\t")}
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
