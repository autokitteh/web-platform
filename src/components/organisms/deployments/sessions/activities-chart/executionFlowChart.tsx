import React, { useEffect, useState } from "react";

import dayjs from "dayjs";
import bigIntSupport from "dayjs/plugin/bigIntSupport";
import ReactApexChart from "react-apexcharts";
import { useTranslation } from "react-i18next";

import { SessionActivityChartRepresentation } from "@src/types/models";

dayjs.extend(bigIntSupport);

export const ExecutionFlowChart = ({ activities }: { activities: SessionActivityChartRepresentation[] }) => {
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.executionFlowChart" });

	const [state, setState] = useState<{ options: ApexCharts.ApexOptions; series: ApexAxisChartSeries }>({
		series: [],
		options: {},
	});

	useEffect(() => {
		setState({
			series: [{ data: activities }],
			options: {
				dataLabels: {
					enabled: true,
					formatter: function (val: number[]) {
						const duration = ((val[1] - val[0]) / 1000).toFixed(1);
						return `${duration}s`;
					},
				},
				tooltip: {
					custom: function ({ dataPointIndex }) {
						const { duration, endTime, startTime, functionName } = activities[dataPointIndex];
						return `<div class="p-2 text-black">
								<div><b>${functionName}</b></div>
								<div>${t("startTime")} ${startTime}</div>
								<div>${t("endTime")}: ${endTime}</div>
								<div>${t("duration")}: ${duration}</div>
							  </div>`;
					},
				},
				chart: {
					height: 400,
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
						enabled: false,
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activities]);

	if (!state.series?.length || !state.series[0]?.data?.length) {
		return <div className="p-4 text-center text-gray-500">No activity data to display.</div>;
	}

	return (
		<div className="w-full">
			<ReactApexChart
				className="border-b border-gray-900"
				height={400}
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
