import React, { useEffect, useState } from "react";

import { Timestamp as ProtoTimestamp } from "@ak-proto-ts/google/protobuf/timestamp_pb";
import dayjs from "dayjs";
import bigIntSupport from "dayjs/plugin/bigIntSupport";
import ReactApexChart from "react-apexcharts";
import { useParams } from "react-router-dom";

import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { SessionsService } from "@services/sessions.service";
import { ActivityState, SessionLogType } from "@src/enums";
import { SessionActivity } from "@src/interfaces/models/session.interface";
import { ApexChartItemType } from "@src/types/components";

dayjs.extend(bigIntSupport);

export const ExecutionFlowChart = ({ activities }: { activities: SessionActivity[] }) => {
	const { sessionId } = useParams();
	const [state, setState] = useState<{ options: ApexCharts.ApexOptions; series: ApexAxisChartSeries }>({
		series: [],
		options: {},
	});

	const [chartActivities, setChartActivities] = useState<ApexChartItemType[]>([]);

	const convertActivitiesToSeriesData = (activities: SessionActivity[]) => {
		return activities.map((activity, index) => {
			const startDate = activity.startTime instanceof Date ? dayjs(activity.startTime).toDate() : new Date();
			const endDate = activity.endTime instanceof Date ? dayjs(activity.endTime).toDate() : startDate;
			const fillColor = "#00E396";

			console.log(startDate, endDate);

			return {
				x: `${activity.functionName || `Activity ${index + 1}`}`,
				y: [startDate.getTime(), endDate.getTime()],
				fillColor,
			};
		});
	};

	// useEffect(() => {
	// 	if (!activities.length) return;
	// 	const seriesData = convertActivitiesToSeriesData(activities).reverse();
	// 	setChartActivities(seriesData);
	// }, [activities]);

	useEffect(() => {
		loadActivities();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionId]);

	// const getTooltipContent = (activity: SessionActivity) => {
	// 	const startTime = dayjs(activity.startTime).format("HH:mm:ss");
	// 	const endTime = dayjs(activity.endTime || new Date()).format("HH:mm:ss");
	// 	const duration = dayjs.duration(dayjs(activity.endTime || new Date()).diff(dayjs(activity.startTime)));

	// 	return `
	// 		<div class="p-2 bg-gray-900 text-white rounded-md">				<div class="p-2 bg-gray-900 text-white rounded-md">
	// 			<div>${t("function")}: ${activity.functionName}</div>					<div>${t("function")}: ${activity.functionName}</div>
	// 			<div>${t("status")}: <span style="color: ${statusColor}">${String(activity?.status || t("unknown"))}</span></div>					<div>${t("status")}: <span style="color: ${statusColor}">${statusLabel}</span></div>
	// 			<div>${t("startTime")}: ${startTime}</div>
	// 			<div>${t("endTime")}: ${endTime}</div>
	// 			<div>${t("duration")}: ${formatDuration(duration)}</div>					<div>${t("duration")}: ${formatDuration(duration)}</div>
	// 		</div>				</div>
	// 	`;
	// };

	const loadActivities = async () => {
		const protoTimestampToDate = (timestamp: ProtoTimestamp | undefined | null): Date | undefined => {
			if (!timestamp || timestamp.seconds == null || timestamp.nanos == null) {
				return undefined;
			}
			const seconds = BigInt(timestamp.seconds);
			const nanos = Number(timestamp.nanos);
			return dayjs(seconds * 1000n + BigInt(Math.floor(nanos / 1000000))).toDate();
		};

		try {
			const {
				data: { records: protoRecords },
			} = await SessionsService.getLogRecordsBySessionId(
				sessionId!,
				undefined,
				undefined,
				SessionLogType.Activity
			);

			if (!protoRecords || !protoRecords.length) {
				setState({ series: [], options: {} });
				return;
			}

			const activities: SessionActivity[] = [];
			let currentActivity: Partial<SessionActivity> | null = null;

			for (let i = protoRecords.length - 1; i >= 0; i--) {
				const log: ProtoSessionLogRecord = protoRecords[i];
				const { callAttemptComplete, callAttemptStart, callSpec, state: logState } = log;
				const logTime = protoTimestampToDate(log.t);

				if (callSpec) {
					if (currentActivity) {
						if (currentActivity.functionName && currentActivity.startTime && currentActivity.status) {
							if (currentActivity.endTime) {
								activities.push(currentActivity as SessionActivity);
							}
						}
					}
					currentActivity = {
						functionName: callSpec?.function?.function?.name || "Unnamed Activity",
						startTime: logTime,
						args: [],
						kwargs: {},
						endTime: undefined,
						returnJSONValue: {},
						status: "created" as keyof ActivityState,
					};
				} else if (callAttemptStart && currentActivity) {
					const attemptStartTime = protoTimestampToDate(callAttemptStart.startedAt);
					if (
						attemptStartTime &&
						(!currentActivity.startTime || attemptStartTime < currentActivity.startTime)
					) {
						currentActivity.startTime = attemptStartTime;
					}
				} else if (callAttemptComplete && currentActivity) {
					currentActivity.status = callAttemptComplete.result?.error
						? ("error" as keyof ActivityState)
						: ("completed" as keyof ActivityState);
					currentActivity.endTime =
						protoTimestampToDate(callAttemptComplete.completedAt) || logTime || new Date();
				} else if (logState?.error && currentActivity) {
					if (currentActivity.status !== ("completed" as keyof ActivityState)) {
						currentActivity.status = "error" as keyof ActivityState;
						if (!currentActivity.endTime) {
							currentActivity.endTime = logTime || new Date();
						}
					}
				}
			}

			if (currentActivity) {
				if (currentActivity.functionName && currentActivity.startTime && currentActivity.status) {
					if (
						!currentActivity.endTime &&
						(currentActivity.status === ActivityState.running ||
							currentActivity.status === ActivityState.created)
					) {
						console.warn(
							`First activity "${currentActivity.functionName}" was still running/created, using current time as end.`
						);
						currentActivity.endTime = new Date();
						if (currentActivity.status === ActivityState.created) {
							currentActivity.status = ActivityState.running;
						}
					}
					if (currentActivity.endTime) {
						activities.push(currentActivity as SessionActivity);
					} else {
						console.warn(
							"Final (first chronologically) activity skipped due to missing end time:",
							currentActivity.functionName
						);
					}
				} else {
					console.warn("Incomplete final (first chronologically) activity data skipped:", currentActivity);
				}
			}

			const finalActivities = activities;
			setChartActivities(convertActivitiesToSeriesData(finalActivities) || []);

			if (!finalActivities.length) {
				console.warn("No valid activities processed from logs.");
				setState({
					series: [],
					options: {},
				});
				return;
			}
		} catch (error) {
			console.error("Failed to load or process activity data:", error);
		}
	};

	useEffect(() => {
		setState({
			series: [{ data: chartActivities }],
			options: {
				dataLabels: {
					enabled: true,
					formatter: function (val, opts) {
						const duration = ((val[1] - val[0]) / 1000).toFixed(1);
						return `${duration}s`;
					},
				},
				tooltip: {
					custom: function ({ series, seriesIndex, dataPointIndex, w }) {
						const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
						const startTime = new Date(data.y[0]).toLocaleTimeString();
						const endTime = new Date(data.y[1]).toLocaleTimeString();
						const duration = ((data.y[1] - data.y[0]) / 1000).toFixed(2); // Duration in seconds

						return `<div class="p-2 text-black">
								<div><b>${data.x}</b></div>
								<div>Start: ${startTime}</div>
								<div>End: ${endTime}</div>
								<div>Duration: ${duration}s</div>
							  </div>`;
					},
				},
				chart: {
					height: 300,
					type: "rangeBar",
					animations: {
						enabled: false,
					},
					toolbar: {
						show: true,
						tools: {
							download: true,
							zoomin: true,
							zoomout: true,
							reset: true,
							pan: true,
							selection: true,
						},
						autoSelected: "pan",
					},
					zoom: {
						allowMouseWheelZoom: false,
					},
					events: {
						beforeZoom: function (_, { xaxis }) {
							return {
								xaxis: {
									min: Math.round(xaxis.min),
									max: Math.round(xaxis.max),
								},
							};
						},
					},
				},
				xaxis: {
					type: "datetime",
					labels: {
						formatter: (value) => dayjs(value).format("HH:mm:ss:SSS"),
						datetimeUTC: false,
					},
				},
				plotOptions: {
					bar: {
						horizontal: true,
						barHeight: "80%",
						distributed: false,
					},
				},
				grid: {
					row: {
						colors: ["transparent", "rgba(0,0,0,0.05)"],
						opacity: 0.5,
					},
				},
			},
		});
	}, [chartActivities]);

	if (!state.series?.length || !state.series[0]?.data?.length) {
		return <div className="p-4 text-center text-gray-500">No activity data to display.</div>;
	}

	return (
		<div className="w-full" style={{ maxHeight: "650px" }}>
			<ReactApexChart
				className="border-b border-gray-900"
				height={350}
				id="executionFlowChart"
				options={{
					...state.options,
					chart: {
						...state.options.chart,
					},
				}}
				series={state.series}
				type="rangeBar"
			/>
		</div>
	);
};
