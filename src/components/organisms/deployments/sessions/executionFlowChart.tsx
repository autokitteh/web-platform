import React, { useMemo } from "react";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import resolveConfig from "tailwindcss/resolveConfig";

import { ActivityState, EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
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
	const location = useLocation();
	const navigate = useNavigate();
	const { projectId, sessionId, deploymentId } = useParams();

	const formatDuration = (duration: ReturnType<typeof dayjs.duration>): string => {
		const hours = Math.floor(duration.asHours());
		const minutes = duration.minutes();
		const seconds = duration.seconds();

		if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
		if (minutes > 0) return `${minutes}m ${seconds}s`;
		return `${seconds}s`;
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

		if (totalDuration <= 100) {
			return {
				min: totalMin - 5000,
				max: totalMin + 5000,
			};
		}

		if (totalDuration <= 15000) {
			const center = totalMin + totalDuration / 2;
			return {
				min: center - 7500,
				max: center + 7500,
			};
		}

		return {
			min: totalMin,
			max: totalMin + 15000,
		};
	};

	const timeRange = useMemo(getTimeRange, [activities]);

	const getChartData = () => {
		return activities.map((activity, index) => {
			const startTime = dayjs(activity.startTime);
			const endTime = dayjs(activity.endTime || new Date());
			const duration = dayjs.duration(endTime.diff(startTime));

			const startTimeValue = new Date(activity.startTime).getTime();
			const endTimeValue = new Date(activity.endTime || new Date()).getTime();

			const timeDiff = endTimeValue - startTimeValue;
			const oneSecondInMs = 1000;

			let adjustedStartTime = startTimeValue;
			let adjustedEndTime = endTimeValue;

			if (timeDiff < oneSecondInMs) {
				const halfSecondInMs = oneSecondInMs / 2;
				adjustedStartTime = startTimeValue - halfSecondInMs;
				adjustedEndTime = startTimeValue + halfSecondInMs;
			}

			return {
				name: `${activity.functionName} (${activities.length - index})`,
				data: [
					{
						x: `${activity.functionName} (${activities.length - index})`,
						y: [adjustedStartTime, adjustedEndTime],
						fillColor: statusColors[activity.status as keyof typeof statusColors],
						activity: activity,
						duration: duration,
					},
				],
			};
		});
	};

	const chartData = useMemo(getChartData, [activities]);

	const getTooltipContent = (activity: SessionActivity) => {
		const statusColor = statusColors[activity.status as keyof typeof statusColors];
		const startTime = dayjs(activity.startTime).format("HH:mm:ss");
		const endTime = dayjs(activity.endTime || new Date()).format("HH:mm:ss");
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

	const options = {
		chart: {
			type: "rangeBar" as const,
			height: 200,
			background: "black",
			toolbar: {
				show: true,
				tools: {
					download:
						'<svg width="20px" height="20px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/></svg>',
					selection: false,
					zoom: false,
					zoomin: '<svg width="20px" height="20px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/></svg>',
					zoomout:
						'<svg width="20px" height="20px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM184 232l144 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-144 0c-13.3 0-24-10.7-24-24s10.7-24 24-24z"/></svg>',
					pan: '<svg width="22px" height="22px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 208c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-176c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 272c0 1.5 0 3.1 .1 4.6L67.6 283c-16-15.2-41.3-14.6-56.6 1.4s-14.6 41.3 1.4 56.6L124.8 448c43.1 41.1 100.4 64 160 64l19.2 0c97.2 0 176-78.8 176-176l0-208c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-176c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 176c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-208z"/></svg>',
					reset: '<svg width="19px" height="19px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M463.5 224l8.5 0c13.3 0 24-10.7 24-24l0-128c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8l119.5 0z"/></svg>',
				},
			},
			zoom: {
				enabled: true,
				allowMouseWheelZoom: false,
			},
			pan: {
				enabled: true,
			},
			events: {
				click: async (
					event: MouseEvent,
					chartContext: any,
					config: { dataPointIndex: number; seriesIndex: number }
				) => {
					const activity = activities[config.seriesIndex];
					if (!activity) return;

					const isExecutionFlowTab = location.pathname.endsWith("/executionflow");

					if (!isExecutionFlowTab) {
						const basePath = deploymentId
							? `/projects/${projectId}/deployments/${deploymentId}/sessions/${sessionId}/executionflow`
							: `/projects/${projectId}/sessions/${sessionId}/executionflow`;

						await navigate(basePath);

						setTimeout(() => {
							triggerEvent(EventListenerName.selectSessionActivity, { activity });
						}, 100);

						return;
					}

					triggerEvent(EventListenerName.selectSessionActivity, { activity });
				},
			},
		},
		plotOptions: {
			bar: {
				borderRadius: 1,
				horizontal: true,
				rangeBarGroupRows: true,
			},
		},
		legend: {
			show: false,
		},
		xaxis: {
			labels: {
				style: { colors: twConfig.theme.colors.white["DEFAULT"] },
				formatter: (value: string) => dayjs(Number(value)).format("HH:mm:ss"),
				offsetX: 12,
			},
			min: timeRange.min,
			max: timeRange.max,
			tickAmount: Math.ceil((timeRange.max - timeRange.min) / 5000),
		},
		yaxis: {
			labels: { style: { colors: twConfig.theme.colors.white["DEFAULT"] } },
			forceNiceScale: true,
		},
		grid: { show: false },
		tooltip: {
			custom: ({ seriesIndex }: { seriesIndex: number }) => {
				const activity = activities[seriesIndex];

				return getTooltipContent(activity);
			},
		},
	};

	const validChartData = chartData.filter((series) => series && series.data && series.data.length > 0);

	if (!validChartData.length) {
		return null;
	}

	const chartHeight = Math.max(250, activities.length * 25 + 20);

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
