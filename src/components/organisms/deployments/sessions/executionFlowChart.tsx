import React, { useMemo } from "react";

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
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.executionFlowChart" });
	const { t: tDeployments } = useTranslation("deployments");

	const formatDuration = (duration: ReturnType<typeof dayjs.duration>): string => {
		const hours = Math.floor(duration.asHours());
		const minutes = duration.minutes();
		const seconds = duration.seconds();
		const milliseconds = duration.milliseconds();

		if (hours > 0) return `${hours}h ${minutes}m ${seconds}.${milliseconds}s`;
		if (minutes > 0) return `${minutes}m ${seconds}.${milliseconds}s`;
		return `${seconds}.${milliseconds}s`;
	};

	const getTimeRange = (): {
		max: number;
		min: number;
	} => {
		if (!activities.length) {
			const now = dayjs();
			return {
				min: now.subtract(7.5, "second").valueOf(),
				max: now.add(7.5, "second").valueOf(),
			};
		}

		const startTimes = activities.map((a) => dayjs(a.startTime).valueOf());
		const endTimes = activities.map((a) => dayjs(a?.endTime || new Date()).valueOf());

		const totalMin = Math.min(...startTimes);
		const totalMax = Math.max(...endTimes);
		const totalDuration = totalMax - totalMin;

		// Add padding as a percentage of the total duration
		const paddingPercentage = 0.1; // 10% padding on each side
		const padding = Math.max(totalDuration * paddingPercentage, 2000); // at least 2 seconds padding

		return {
			min: Math.floor(totalMin - padding),
			max: Math.ceil(totalMax + padding),
		};
	};

	const timeRange = getTimeRange();

	const getChartData = () => {
		// Create a stable sort based on start time and function name
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

				// Ensure minimum duration of 500ms for visibility
				const minDuration = 500;
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
							rangeName: activity.key, // Add a stable identifier
						},
					],
				};
			});
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

	const chartHeight = Math.max(300, activities.length * 40); // Increased height per activity

	const options = {
		chart: {
			type: "rangeBar" as const,
			height: chartHeight,
			background: "black",
			toolbar: {
				show: true,
				tools: {
					download: true,
					selection: false,
					zoom: true,
					zoomin: true,
					zoomout: true,
					pan: true,
					reset: true,
				},
			},
			zoom: {
				enabled: true,
				autoScaleYaxis: true,
			},
			animations: {
				enabled: false,
			},
			events: {
				mouseMove: function (event: any) {
					// Enable dragging when mouse is over the chart
					if (event.target.classList.contains("apexcharts-svg")) {
						event.target.style.cursor = "grab";
					}
				},
				mouseLeave: function (event: any) {
					// Reset cursor when mouse leaves the chart
					if (event.target.classList.contains("apexcharts-svg")) {
						event.target.style.cursor = "default";
					}
				},
			},
		},
		plotOptions: {
			bar: {
				horizontal: true,
				barHeight: "80%",
				rangeBarGroupRows: true,
			},
		},
		xaxis: {
			type: "datetime" as const,
			labels: {
				style: { colors: twConfig.theme.colors.white["DEFAULT"] },
				datetimeUTC: false,
				formatter: (value: string, timestamp?: number) => {
					if (timestamp) {
						return dayjs(timestamp).format("HH:mm:ss.SSS");
					}
					return value;
				},
			},
			min: timeRange.min,
			max: timeRange.max,
			tickAmount: 8,
			axisBorder: {
				show: true,
			},
			axisTicks: {
				show: true,
			},
		},
		yaxis: {
			labels: {
				style: { colors: twConfig.theme.colors.white["DEFAULT"] },
				maxWidth: 300,
			},
			axisBorder: {
				show: true,
			},
			axisTicks: {
				show: true,
			},
			reversed: true, // Reverse the Y-axis to display activities from top to bottom
		},
		grid: {
			show: true,
			borderColor: twConfig.theme.colors.gray[900],
			position: "back" as const,
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
			custom: ({ seriesIndex }: { seriesIndex: number }) => {
				const activity = activities[seriesIndex];
				return getTooltipContent(activity);
			},
			x: {
				format: "HH:mm:ss.SSS",
			},
		},
		// Add scrollbar for long activity lists
		scrollbar: {
			enabled: true,
			offsetY: 0,
			height: 10,
			background: twConfig.theme.colors.gray[800],
			bar: {
				background: twConfig.theme.colors.gray[600],
			},
		},
	};

	const validChartData = useMemo(() => getChartData(), [activities]);

	if (!validChartData.length) {
		return null;
	}

	return (
		<Chart
			className="border-b border-gray-900"
			height={chartHeight}
			options={options}
			series={validChartData}
			type="rangeBar"
		/>
	);
};
