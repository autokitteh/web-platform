import React, { useMemo, useEffect } from "react";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import resolveConfig from "tailwindcss/resolveConfig";

import { ActivityState } from "@src/enums";
import { SessionActivity } from "@src/interfaces/models";
import tailwindConfig from "tailwind-config";

dayjs.extend(duration);

const twConfig = resolveConfig(tailwindConfig);

const statusColors = {
	[ActivityState.completed]: twConfig.theme.colors.green[800],
	[ActivityState.error]: twConfig.theme.colors.error["DEFAULT"],
	[ActivityState.running]: twConfig.theme.colors.blue[500],
	[ActivityState.created]: twConfig.theme.colors.white["DEFAULT"],
} as const;

export const ExecutionFlowChart = ({ activities }: { activities: SessionActivity[] }) => {
	const chartHeight = Math.max(250, activities.length * 30);
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.executionFlowChart" });
	const { t: tDeployments } = useTranslation("deployments");

	const validChartData = useMemo(() => {
		// Calculate the total time range of activities
		const startTimes = activities.map((a) => dayjs(a.startTime).valueOf());
		const endTimes = activities.map((a) => dayjs(a.endTime || new Date()).valueOf());
		const minTime = Math.min(...startTimes);
		const maxTime = Math.max(...endTimes);
		const totalRange = maxTime - minTime;

		// Set a dynamic minimum duration (e.g., 1% of total range or 100ms)
		const minDuration = Math.max(100, totalRange * 0.01);

		return [...activities]
			.sort((a, b) => {
				const timeCompare = dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf();
				if (timeCompare === 0) {
					return a.functionName.localeCompare(b.functionName);
				}
				return timeCompare;
			})
			.map((activity, index) => {
				const startTime = dayjs(activity.startTime);
				const endTime = dayjs(activity.endTime || new Date());
				const duration = dayjs.duration(endTime.diff(startTime));

				const startTimeValue = startTime.valueOf();
				const endTimeValue = endTime.valueOf();

				const actualDuration = endTimeValue - startTimeValue;
				const adjustedEndTime = actualDuration < minDuration ? startTimeValue + minDuration : endTimeValue;

				return {
					name: `${activity.functionName} (${index + 1})`,
					data: [
						{
							x: `${activity.functionName} (${index + 1})`,
							y: [startTimeValue, adjustedEndTime],
							fillColor: statusColors[activity.status as keyof typeof statusColors],
							activity: activity,
							duration: duration,
							rangeName: activity.key,
						},
					],
				};
			});
	}, [activities]);

	const formatDuration = (duration: ReturnType<typeof dayjs.duration>): string => {
		const hours = Math.floor(duration.asHours());
		const minutes = duration.minutes();
		const seconds = duration.seconds();
		const milliseconds = duration.milliseconds();

		if (hours > 0) return `${hours}h ${minutes}m ${seconds}.${milliseconds}s`;
		if (minutes > 0) return `${minutes}m ${seconds}.${milliseconds}s`;
		return `${seconds}.${milliseconds}s`;
	};

	const getTooltipContent = (activity: SessionActivity) => {
		const statusColor = statusColors[activity.status as keyof typeof statusColors];
		const startTime = dayjs(activity.startTime).format("HH:mm:ss.SSS");
		const endTime = dayjs(activity.endTime || new Date()).format("HH:mm:ss.SSS");
		const statusLabel = tDeployments(
			`activities.statuses.${ActivityState[activity.status as keyof typeof ActivityState]}`
		);
		const duration = dayjs.duration(dayjs(activity.endTime || new Date()).diff(dayjs(activity.startTime)));
		return `
			<div class="p-2 bg-gray-900 text-white rounded-md">
				<div>${t("function")}: ${activity.functionName}</div>
				<div>${t("status")}: <span style="color: ${statusColor}">${statusLabel}</span></div>
				<div>${t("startTime")}: ${startTime}</div>
				<div>${t("endTime")}: ${endTime}</div>
				<div>${t("duration")}: ${formatDuration(duration)}</div>
			</div>
		`;
	};

	// useEffect(() => {
	// 	const handleResize = () => {
	// 		if (window.ApexCharts) {
	// 			// Force chart update on resize to fix zoom issues
	// 			window.ApexCharts.exec(
	// 				"executionFlowChart",
	// 				"updateOptions",
	// 				{
	// 					chart: {
	// 						height: chartHeight,
	// 					},
	// 				},
	// 				false,
	// 				true
	// 			);
	// 		}
	// 	};

	// 	window.addEventListener("resize", handleResize);
	// 	return () => window.removeEventListener("resize", handleResize);
	// }, [chartHeight]);

	const options = {
		plotOptions: {
			bar: {
				horizontal: true,
				barHeight: "70%",
				rangeBarGroupRows: true,
			},
		},
		grid: {
			show: true,
			borderColor: twConfig.theme.colors.gray[900],
			position: "back",
			xaxis: {
				lines: {
					show: true,
				},
			},
			yaxis: {
				lines: {
					show: true,
				},
			},
		},
		tooltip: {
			custom: function (opts) {
				const dataPointIndex = opts.dataPointIndex;
				const seriesIndex = opts.seriesIndex;
				const activity = opts.w.config.series[seriesIndex].data[dataPointIndex].activity;
				return getTooltipContent(activity);
			},
		},
		chart: {
			type: "rangeBar",
			height: chartHeight,
			background: "transparent",
			toolbar: {
				show: true,
				tools: {
					download: true,
					selection: true,
					zoom: true,
					zoomin: true,
					zoomout: true,
					pan: true,
					reset: true,
				},
				autoSelected: "zoom",
			},
			animations: {
				enabled: false,
			},
			zoom: {
				enabled: true,
				type: "x",
				autoScaleYaxis: true,
			},
			events: {
				zoomed: function (chartContext, { xaxis }) {
					console.log("Zoomed to range:", xaxis);
					// Optionally force a re-render or update options
					chartContext.updateOptions(
						{
							chart: {
								height: chartHeight,
							},
						},
						false,
						true
					);
				},
				beforeZoom: function (chartContext, { xaxis }) {
					// Ensure the zoom range is valid
					const minRange = 100; // Minimum 100ms range
					if (xaxis.max - xaxis.min < minRange) {
						return {
							xaxis: {
								min: xaxis.min,
								max: xaxis.min + minRange,
							},
						};
					}
					return { xaxis };
				},
			},
		},
		dataLabels: {
			enabled: false,
		},
		xaxis: {
			type: "datetime",
			labels: {
				style: { colors: twConfig.theme.colors.white["DEFAULT"] },
				datetimeUTC: false,
				formatter: (value, timestamp) => {
					if (timestamp) {
						return dayjs(timestamp).format("HH:mm:ss.SSS");
					}
					return value;
				},
			},
			tickAmount: 8, // Increase ticks for better readability
		},
		yaxis: {
			labels: {
				style: { colors: twConfig.theme.colors.white["DEFAULT"] },
				maxWidth: 300,
			},
			reversed: true,
		},
		pan: {
			enabled: true,
			type: "x",
		},
	};

	useEffect(() => {
		console.log("ExecutionFlowChart mounted");
		return () => console.log("ExecutionFlowChart unmounted");
	}, []);

	useEffect(() => {
		console.log("Activities received:", activities);
		console.log("Processed chart data:", validChartData);
	}, [activities, validChartData]);

	if (!validChartData?.length) {
		return null;
	}

	return (
		<div className="w-full" style={{ maxHeight: `${chartHeight}px` }}>
			<Chart
				className="border-b border-gray-900"
				height={chartHeight}
				id="executionFlowChart"
				options={options}
				series={validChartData}
				type="rangeBar"
			/>
		</div>
	);
};
