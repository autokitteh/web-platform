import React, { useEffect, useMemo, useState } from "react";

import dayjs from "dayjs";
import bigIntSupport from "dayjs/plugin/bigIntSupport";
import ReactApexChart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { triggerEvent, useEventListener } from "@src/hooks";
import { SessionActivity } from "@src/interfaces/models";
import { twConfig } from "@utilities";

dayjs.extend(bigIntSupport);

export const ExecutionFlowChart = ({ activities }: { activities: SessionActivity[] }) => {
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.executionFlowChart" });
	const location = useLocation();
	const navigate = useNavigate();
	const { projectId, sessionId, deploymentId } = useParams();

	const [state, setState] = useState<{ options: ApexCharts.ApexOptions; series: ApexAxisChartSeries }>({
		series: [],
		options: {},
	});
	const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

	useEventListener(EventListenerName.selectSessionActivity, (event: CustomEvent<{ activity?: SessionActivity }>) => {
		const activity = event.detail?.activity;
		if (!activity) setActiveBarIndex(null);

		const index = activities.findIndex((a) => a === activity);
		if (index !== -1) {
			setActiveBarIndex(index);
		}
	});

	const series = useMemo(() => {
		return activities
			.filter((activity) => activity.chartRepresentation)
			.map(({ chartRepresentation }, index) => ({
				x: chartRepresentation?.x,
				y: chartRepresentation?.y,
				fillColor:
					activeBarIndex === index ? twConfig.theme.colors.green[500] : twConfig.theme.colors.blue[500],
			}));
	}, [activeBarIndex, activities]);

	useEffect(() => {
		setState({
			series: [{ data: series }],
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
							selection: false,
						},
					},
					zoom: {
						allowMouseWheelZoom: false,
						enabled: false,
					},
					events: {
						click: async (_event: MouseEvent, _chartContext: any, config: { dataPointIndex: number }) => {
							const activity = activities[config.dataPointIndex];
							if (!activity) return;
							const isExecutionFlowTab = location.pathname.endsWith("/executionflow");

							if (!isExecutionFlowTab) {
								const basePath = deploymentId
									? `/projects/${projectId}/deployments/${deploymentId}/sessions/${sessionId}/executionflow`
									: `/projects/${projectId}/sessions/${sessionId}/executionflow`;

								await navigate(basePath);
							}

							setTimeout(() => {
								triggerEvent(EventListenerName.selectSessionActivity, { activity });
							}, 100);
						},
						dataPointSelection: function (_event, _chartContext, config) {
							const index = config.dataPointIndex;
							if (activeBarIndex !== index) {
								setActiveBarIndex(index);
							}
						},
					},
				},
				yaxis: {
					labels: {
						show: true,
						style: {
							colors: "#fff",
						},
						align: "left",
						minWidth: 50,
						maxWidth: 100,
					},
				},
				xaxis: {
					type: "datetime",
					labels: {
						show: true,
						style: {
							colors: "#fff",
						},
					},
				},
				plotOptions: {
					bar: {
						horizontal: true,
						barHeight: "80%",
					},
				},
				fill: {
					type: "solid",
					opacity: 1,
				},
				states: {
					hover: {
						filter: {
							type: "none",
						},
					},
					active: {
						allowMultipleDataPointsSelection: false,
						filter: {
							type: "none",
						},
					},
				},
			},
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activities, location, activeBarIndex]);

	if (!state.series?.length || !state.series[0]?.data?.length) {
		return <div className="p-4 text-center text-gray-500">{t("noActivityFound")}</div>;
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
