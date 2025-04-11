import React, { useMemo } from "react";

import moment from "moment";
import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import resolveConfig from "tailwindcss/resolveConfig";

import { ActivityState, EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { SessionActivity } from "@src/interfaces/models";
import tailwindConfig from "tailwind-config";

const twConfig = resolveConfig(tailwindConfig);

const statusColors = {
	[ActivityState.completed]: twConfig.theme.colors.green[800],
	[ActivityState.error]: twConfig.theme.colors.error["DEFAULT"],
	[ActivityState.running]: twConfig.theme.colors.blue[500],
	[ActivityState.created]: twConfig.theme.colors.white["DEFAULT"],
} as const;

export const ExecutionFlowChart = ({ activities }: { activities: SessionActivity[] }) => {
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.executionFlowChart" });

	const formatDuration = (duration: moment.Duration): string => {
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
			const now = moment();
			return {
				min: now.clone().subtract(1, "hour").valueOf(),
				max: now.clone().add(1, "hour").valueOf(),
			};
		}

		const startTimes = activities.map((a) => new Date(a.startTime).getTime());
		const endTimes = activities.map((a) => new Date(a.endTime || new Date()).getTime());

		return {
			min: Math.min(...startTimes),
			max: Math.max(...endTimes),
		};
	};

	const timeRange = useMemo(getTimeRange, [activities]);

	const getChartData = () => {
		return [
			{
				name: "Activities",
				data: activities.map((activity, index) => {
					const startTime = moment(activity.startTime);
					const endTime = moment(activity.endTime || new Date());
					const duration = moment.duration(endTime.diff(startTime));

					return {
						x: `${activity.functionName} (${activities.length - index})`,
						y: [new Date(activity.startTime).getTime(), new Date(activity.endTime || new Date()).getTime()],
						fillColor: statusColors[activity.status as keyof typeof statusColors],
						activity: activity,
						duration: duration,
					};
				}),
			},
		];
	};

	const chartData = useMemo(getChartData, [activities]);

	const getTooltipContent = (activity: SessionActivity, duration: moment.Duration) => {
		const statusColor = statusColors[activity.status as keyof typeof statusColors];
		return `
			<div class="p-2 bg-gray-900 text-white rounded-md">
				<div>${t("function")}: ${activity.functionName}</div>
				<div>${t("status")}: <span style="color: ${statusColor}">${String(activity?.status || t("unknown"))}</span></div>
				<div>${t("duration")}: ${formatDuration(duration)}</div>
			</div>
		`;
	};

	const options = {
		chart: {
			type: "rangeBar" as const,
			height: 200,
			toolbar: { show: false },
			zoom: { enabled: false },
			pan: { enabled: true, type: "x" },
			events: {
				click: (event: MouseEvent, chartContext: any, config: { dataPointIndex: number }) => {
					const activity = activities[config.dataPointIndex];
					if (activity) {
						triggerEvent(EventListenerName.selectSessionActivity, { activity });
					}
				},
			},
		},
		plotOptions: {
			bar: {
				horizontal: true,
				rangeBarGroupRows: true,
				distributed: true,
			},
		},
		fill: { type: "solid", opacity: 1 },
		xaxis: {
			type: "datetime" as const,
			labels: {
				style: { colors: twConfig.theme.colors.white["DEFAULT"] },
				formatter: (value: string) => moment(Number(value)).format("HH:mm:ss"),
			},
			min: timeRange.min,
			max: timeRange.max,
		},
		yaxis: {
			labels: { style: { colors: twConfig.theme.colors.white["DEFAULT"] } },
			forceNiceScale: true,
		},
		grid: { show: false },
		legend: { show: false },
		tooltip: {
			custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
				const activity = activities[dataPointIndex];
				const startTime = moment(activity.startTime);
				const endTime = moment(activity.endTime || new Date());
				const duration = moment.duration(endTime.diff(startTime));
				return getTooltipContent(activity, duration);
			},
		},
	};

	if (!activities.length) {
		return null;
	}

	return (
		<Chart className="border-b border-gray-900" height={200} options={options} series={chartData} type="rangeBar" />
	);
};
