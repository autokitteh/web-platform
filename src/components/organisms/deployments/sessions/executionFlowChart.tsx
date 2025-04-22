import React, { useEffect, useRef, useState } from "react";

import { Timestamp as ProtoTimestamp } from "@bufbuild/protobuf";
import dayjs from "dayjs";
import bigIntSupport from "dayjs/plugin/bigIntSupport";
import ReactApexChart from "react-apexcharts"; // Make sure to use ReactApexChart, not Chart

import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { SessionsService } from "@services/sessions.service";
import { ActivityState, EventListenerName, SessionLogType } from "@src/enums";
import { useEventListener } from "@src/hooks";
import { SessionActivity } from "@src/interfaces/models/session.interface";

dayjs.extend(bigIntSupport);

export const ExecutionFlowChart = () => {
	const [chartInstance, setChartInstance] = useState<any>(null);
	const [state, setState] = useState<{ options: ApexCharts.ApexOptions; series: ApexAxisChartSeries }>({
		series: [],
		options: {},
	});
	const [currentPage, setCurrentPage] = useState(0);
	const ITEMS_PER_PAGE = 6;
	const [totalPages, setTotalPages] = useState(0);
	const [activities, setActivities] = useState<any[]>([]);
	const [displayedActivities, setDisplayedActivities] = useState<any[]>([]);

	const convertactivitiesToSeriesData = (activities: any[]) => {
		return activities.map((activity, index) => {
			const startDate = activity.startTime instanceof Date ? dayjs(activity.startTime).toDate() : new Date();
			const endDate = activity.endTime instanceof Date ? dayjs(activity.endTime).toDate() : startDate;

			// Determine group based on activity status
			let fillColor;
			let group = "default";

			if (activity.status === ActivityState.error) {
				fillColor = "#FF4560";
				group = "errors";
			} else if (activity.status === ActivityState.completed) {
				fillColor = "#00E396";
				group = "completed";
			} else if (activity.status === ActivityState.running) {
				fillColor = "#008FFB";
				group = "running";
			}

			return {
				x: `${activity.functionName || `Activity ${index + 1}`}`,
				y: [startDate.getTime(), endDate.getTime()],
				fillColor,
				group,
			};
		});
	};

	useEffect(() => {
		if (!activities.length) return;
		setTotalPages(Math.ceil(activities.length / ITEMS_PER_PAGE));

		const startIndex = currentPage * ITEMS_PER_PAGE;
		const visibleActivities = activities.slice(startIndex, startIndex + ITEMS_PER_PAGE);

		const seriesData = convertactivitiesToSeriesData(activities);
		setDisplayedActivities(seriesData);
	}, [activities]);

	useEffect(() => {
		setState({
			series: [{ data: displayedActivities }],
			options: {
				dataLabels: {
					enabled: true,
					formatter: function (val, opts) {
						const duration = ((val[1] - val[0]) / 1000).toFixed(1);
						return `${duration}s`;
					},
				},
				legend: {
					show: true,
					showForSingleSeries: true,
					customLegendItems: ["Completed", "Running", "Error"],
					markers: {
						fillColors: ["#00E396", "#008FFB", "#FF4560"],
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
						autoSelected: "zoom",
					},
					zoom: {
						enabled: true,
						type: "x",
						autoScaleYaxis: true,
						mouseWheel: {
							enabled: false, // Disable mousewheel zoom
						},
						zoomedArea: {
							fill: {
								color: "#90CAF9",
								opacity: 0.4,
							},
							stroke: {
								color: "#0D47A1",
								opacity: 0.4,
								width: 1,
							},
						},
					},
					selection: {
						enabled: true,
						type: "x",
						fill: {
							color: "#008FFB",
							opacity: 0.3,
						},
						stroke: {
							width: 1,
							dashArray: 3,
							color: "#008FFB",
							opacity: 0.4,
						},
					},
					events: {
						beforeZoom: function (chartContext, { xaxis }) {
							console.log("Before zoom event triggered", xaxis);
							return {
								xaxis: {
									min: Math.round(xaxis.min),
									max: Math.round(xaxis.max),
								},
							};
						},
						zoomed: function (chartContext, { xaxis }) {
							console.log("Zoom event triggered", xaxis);
							// Format the x-axis labels after zoom
							setTimeout(() => {
								try {
									if (chartInstance) {
										chartInstance.updateOptions(
											{
												xaxis: {
													type: "datetime",
													labels: {
														formatter: function (value) {
															console.log("Formatting zoomed value:", value);
															return dayjs(value).format("HH:mm:ss:SSS");
														},
														datetimeUTC: false,
													},
												},
											},
											false,
											true
										);
									}
								} catch (error) {
									console.error("Error updating chart after zoom:", error);
								}
							}, 100);
						},
						scrolled: function (chartContext, { xaxis }) {
							console.log("Scroll event triggered", xaxis);
							// Format the x-axis labels after pan/scroll
							setTimeout(() => {
								try {
									if (chartInstance) {
										// Round values for consistency (like you did with zoom)
										const min = Math.round(xaxis.min);
										const max = Math.round(xaxis.max);

										console.log("Applying scroll with rounded values:", { min, max });

										chartInstance.updateOptions(
											{
												xaxis: {
													min: min,
													max: max,
													type: "datetime",
													labels: {
														formatter: function (value) {
															console.log("Formatting scrolled value:", value);
															return dayjs(value).format("HH:mm:ss:SSS");
														},
														datetimeUTC: false,
													},
												},
											},
											false, // No animation
											true // Update synchronously
										);
									}
								} catch (error) {
									console.error("Error updating chart after scroll:", error);
								}
							}, 100);
						},
					},
				},
				xaxis: {
					type: "datetime",
					labels: {
						formatter: function (value) {
							console.log("Initial formatting value:", value);
							return dayjs(value).format("HH:mm:ss:SSS");
						},
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
						colors: ["transparent", "rgba(0,0,0,0.05)"], // Alternating row colors
						opacity: 0.5,
					},
				},
				// Add responsive configuration to maintain usability on different screen sizes
				responsive: [
					{
						breakpoint: 480,
						options: {
							chart: {
								toolbar: {
									show: false,
								},
							},
						},
					},
				],
			},
		});
	}, [displayedActivities]);

	React.useEffect(() => {
		if (!chartInstance) return;

		console.log("Chart instance available");

		// Add event listener for chart container
		const chartContainer = document.getElementById("executionFlowChart");
		if (chartContainer) {
			// Add passive event listeners
			chartContainer.addEventListener("touchstart", handleTouch, { passive: true });
			chartContainer.addEventListener("mousedown", handleMouseAction, { passive: true });
			chartContainer.addEventListener("mouseup", handleMouseAction, { passive: true });
		}

		return () => {
			// Clean up event listeners
			const chartContainer = document.getElementById("executionFlowChart");
			if (chartContainer) {
				chartContainer.removeEventListener("touchstart", handleTouch);
				chartContainer.removeEventListener("mousedown", handleMouseAction);
				chartContainer.removeEventListener("mouseup", handleMouseAction);
			}
		};
	}, [chartInstance]);

	React.useEffect(() => {
		loadActivities();
	}, []);

	const handleTouch = (e) => {
		console.log("Touch event on chart:", e.type);
	};

	const handleMouseAction = (e) => {
		console.log("Mouse event on chart:", e.type);
	};

	React.useEffect(() => {
		return () => {
			const chartContainer = document.getElementById("executionFlowChart");
			if (chartContainer) {
				chartContainer.removeEventListener("touchstart", handleTouch);
				chartContainer.removeEventListener("mousedown", handleMouseAction);
				chartContainer.removeEventListener("mouseup", handleMouseAction);
			}
		};
	}, []);

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
				"ses_01jse8bbx0ezxa87ak374dsz2x",
				undefined,
				undefined,
				SessionLogType.Activity
			);

			if (!protoRecords || !protoRecords.length) {
				console.warn("No activity log records found.");
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
						? ActivityState.error
						: ActivityState.completed;
					currentActivity.endTime =
						protoTimestampToDate(callAttemptComplete.completedAt) || logTime || new Date();
				} else if (logState?.error && currentActivity) {
					if (currentActivity.status !== ActivityState.completed) {
						currentActivity.status = ActivityState.error;
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
			setActivities(finalActivities || []);

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
						events: {
							...state.options.chart?.events,
							mounted: function (chart) {
								setChartInstance(chart);
								console.log("Chart mounted via events.mounted");
							},
						},
					},
				}}
				series={state.series}
				type="rangeBar"
			/>
			{/* {totalPages > 1 ? (
				<div className="mt-3 flex justify-center space-x-2">
					<button
						className={`rounded px-3 py-1 ${currentPage === 0 ? "bg-gray-200 text-gray-500" : "bg-blue-500 text-white"}`}
						disabled={currentPage === 0}
						onClick={() => {
							setCurrentPage((prev) => Math.max(0, prev - 1));
							loadActivities();
						}}
					>
						Previous
					</button>
					<span className="px-3 py-1">
						{currentPage + 1} of {totalPages}
					</span>
					<button
						className={`rounded px-3 py-1 ${currentPage === totalPages - 1 ? "bg-gray-200 text-gray-500" : "bg-blue-500 text-white"}`}
						disabled={currentPage === totalPages - 1}
						onClick={() => {
							setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
							loadActivities();
						}}
					>
						Next
					</button>
				</div>
			) : null} */}
		</div>
	);
};
