import React, { useMemo, useRef, forwardRef, useEffect } from "react";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import Chart, { Props } from "react-apexcharts";
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

export const ChartWithRef = forwardRef<Chart, Props>((props, ref) => <Chart {...props} ref={ref} />);
ChartWithRef.displayName = "ChartWithRef";

export const ExecutionFlowChart = ({ activities }: { activities: SessionActivity[] }) => {
	const chartRef = useRef<Chart>(null);

	const chartHeight = Math.max(500, activities.length * 60);
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.executionFlowChart" });
	const { t: tDeployments } = useTranslation("deployments");

	const validChartData = useMemo(() => {
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

				const minDuration = 500;
				const actualDuration = endTimeValue - startTimeValue;
				const adjustedEndTime = actualDuration < minDuration ? startTimeValue + minDuration : endTimeValue;

				return {
					name: `${activity.functionName} (${index + 1})`,
					data: [
						{
							// Use the function name for x (this will be the category on the y-axis when horizontal)
							x: `${activity.functionName} (${index + 1})`,
							// Keep time values in y for the horizontal range
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

	// const options = {
	// 	chart: {
	// 		type: "rangeBar",
	// 		height: chartHeight,
	// 		background: "black",
	// 		toolbar: {
	// 			show: true,
	// 			tools: {
	// 				download: true,
	// 				selection: true,
	// 				zoom: true,
	// 				zoomin: true,
	// 				zoomout: true,
	// 				pan: true,
	// 				reset: true,
	// 			},
	// 		},
	// 		zoom: {
	// 			enabled: true,
	// 			type: "x",
	// 			autoScaleYaxis: true,
	// 			zoomedArea: {
	// 				fill: {
	// 					color: twConfig.theme.colors.gray[800],
	// 					opacity: 0.4,
	// 				},
	// 				stroke: {
	// 					color: twConfig.theme.colors.gray[600],
	// 					opacity: 0.4,
	// 					width: 1,
	// 				},
	// 			},
	// 		},
	// 		pan: {
	// 			enabled: true,
	// 			type: "x",
	// 		},
	// 		animations: {
	// 			enabled: false,
	// 		},
	// 		events: {
	// 			mouseMove: function (event: any) {
	// 				if (event.target.classList.contains("apexcharts-svg")) {
	// 					event.target.style.cursor = "grab";
	// 				}
	// 			},
	// 			mouseLeave: function (event: any) {
	// 				if (event.target.classList.contains("apexcharts-svg")) {
	// 					event.target.style.cursor = "default";
	// 				}
	// 			},
	// 		},
	// 	},
	// 	plotOptions: {
	// 		bar: {
	// 			horizontal: true,
	// 			barHeight: "70%",
	// 			rangeBarGroupRows: true,
	// 		},
	// 	},
	// 	xaxis: {
	// 		type: "datetime",
	// 		labels: {
	// 			style: { colors: twConfig.theme.colors.white["DEFAULT"] },
	// 			datetimeUTC: false,
	// 			formatter: (value: string, timestamp?: number) => {
	// 				if (timestamp) {
	// 					return dayjs(timestamp).format("HH:mm:ss.SSS");
	// 				}
	// 				return value;
	// 			},
	// 		},
	// 		tickAmount: 8,
	// 		axisBorder: {
	// 			show: true,
	// 		},
	// 		axisTicks: {
	// 			show: true,
	// 		},
	// 	},
	// 	yaxis: {
	// 		labels: {
	// 			style: { colors: twConfig.theme.colors.white["DEFAULT"] },
	// 			maxWidth: 300,
	// 		},
	// 		axisBorder: {
	// 			show: true,
	// 		},
	// 		axisTicks: {
	// 			show: true,
	// 		},
	// 		reversed: true,
	// 	},

	// };

	const options = {
		plotOptions: {
			bar: {
				horizontal: true, // This is crucial for horizontal bars
				barHeight: "70%",
				rangeBarGroupRows: true, // This helps with multiple activities
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
		scrollbar: {
			enabled: true,
			offsetY: 0,
			height: 10,
			background: twConfig.theme.colors.gray[800],
			bar: {
				background: twConfig.theme.colors.gray[600],
			},
		},
		chart: {
			type: "rangeBar",
			zoom: {
				enabled: true,
				type: "xy", // Change to xy to support both axis zoom
				autoScaleYaxis: false, // Set to false to prevent y-axis rescaling
				zoomedArea: {
					fill: {
						color: twConfig.theme.colors.gray[600],
						opacity: 0.4,
					},
					stroke: {
						color: twConfig.theme.colors.gray[400],
						opacity: 0.7,
						width: 1,
					},
				},
			},
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
				autoSelected: "pan", // Change from "zoom" to "pan"
			},
			animations: {
				enabled: false,
			},
		},
		pan: {
			enabled: true,
			type: "xy",
		},
		dataLabels: {
			enabled: false,
		},
		xaxis: {
			type: "datetime",
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
			tickAmount: 6, // Limit the number of ticks to prevent overcrowding
			min: undefined, // Allow dynamic min based on data
			max: undefined, // Allow dynamic max based on data
		},
		yaxis: {
			reversed: true,
		},
		// grid: {
		// 	show: true,
		// 	borderColor: twConfig.theme.colors.gray[900],
		// 	position: "back" as const,
		// },
	};

	useEffect(() => {
		console.log("Activities received:", activities);
		console.log("Processed chart data:", validChartData);
	}, [activities, validChartData]);

	if (!validChartData?.length) {
		return null;
	}

	return (
		<div className="w-full" style={{ minHeight: `${chartHeight}px` }}>
			<ChartWithRef
				className="border-b border-gray-900"
				height={chartHeight}
				options={options}
				ref={chartRef}
				series={validChartData}
				type="rangeBar"
			/>
		</div>
	);
};
