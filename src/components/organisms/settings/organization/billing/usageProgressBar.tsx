import React, { useEffect, useRef } from "react";

import ApexCharts from "apexcharts";

import { HalfCircleProgressBarProps } from "@src/interfaces/components";

export const UsageProgressBar = ({ value, max }: HalfCircleProgressBarProps) => {
	const chartRef = useRef<HTMLDivElement>(null);
	const chartInstance = useRef<ApexCharts | null>(null);

	const percent = Math.min(100, Math.round((value / max) * 100));

	const firstThird = max / 3;
	const secondThird = (2 * max) / 3;

	let color = "#22c55e";
	if (value > secondThird) {
		color = "#ef4444";
	} else if (value > firstThird) {
		color = "#f59e42";
	}

	useEffect(() => {
		if (!chartRef.current) return;

		const options = {
			chart: {
				type: "radialBar" as const,
				height: 200,
			},
			plotOptions: {
				radialBar: {
					hollow: {
						size: "50%",
					},
					dataLabels: {
						show: true,
						name: {
							show: false,
						},
						value: {
							show: true,
							fontSize: "18px",
							fontWeight: 600,
							color: "#ffffff",
							formatter: () => `${value} / ${max}`,
						},
					},
				},
			},
			fill: {
				type: "gradient",
				gradient: {
					shade: "dark",
					type: "horizontal",
					shadeIntensity: 0.5,
					gradientToColors: [color],
					inverseColors: true,
					opacityFrom: 1,
					opacityTo: 1,
					stops: [0, 100],
				},
			},
			colors: [color],
			stroke: {
				lineCap: "round" as const,
			},
			series: [percent],
		};

		if (chartInstance.current) {
			chartInstance.current.destroy();
		}

		chartInstance.current = new ApexCharts(chartRef.current, options);
		chartInstance.current.render();

		return () => {
			if (chartInstance.current) {
				chartInstance.current.destroy();
				chartInstance.current = null;
			}
		};
	}, [value, max, percent, color]);

	return (
		<div className="flex flex-col items-center justify-center">
			<div ref={chartRef} />
		</div>
	);
};
