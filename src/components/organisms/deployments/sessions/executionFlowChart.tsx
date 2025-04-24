import React, { useEffect, useState } from "react";

import dayjs from "dayjs";
import bigIntSupport from "dayjs/plugin/bigIntSupport";
import ReactApexChart from "react-apexcharts";

import { SessionActivity } from "@src/interfaces/models/session.interface";
import { ApexChartItemType } from "@src/types/components";

dayjs.extend(bigIntSupport);

export const ExecutionFlowChart = ({ activities }: { activities: SessionActivity[] }) => {
	const [state, setState] = useState<{ options: ApexCharts.ApexOptions; series: ApexAxisChartSeries }>({
		series: [],
		options: {},
	});

	const [chartActivities, setChartActivities] = useState<ApexChartItemType[]>([]);

	const convertActivitiesToSeriesData = (activities: SessionActivity[]) => {
		return activities.map((activity, index) => {
			const startDate = activity.startTime || new Date();
			const endDate = activity.endTime || startDate;
			const fillColor = "#00E396";

			console.log(startDate, endDate);

			return {
				x: `${activity.functionName || `Activity ${index + 1}`}`,
				y: [startDate.getTime(), endDate.getTime()],
				fillColor,
			};
		});
	};

	useEffect(() => {
		if (!activities.length) return;
		const seriesData = convertActivitiesToSeriesData(activities).reverse();
		setChartActivities(seriesData);
	}, [activities]);

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
