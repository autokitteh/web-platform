import React, { useEffect, useRef, useMemo, useCallback } from "react";

import ApexCharts from "apexcharts";
import { useTranslation } from "react-i18next";

import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";
import { UsageProgressBarProps } from "@src/interfaces/components";
import { useToastStore } from "@src/store";
import { formatNumberWithEllipsis } from "@src/utilities";
import { twConfig } from "@src/utilities/getTailwindConfig.utils";

const colorThresholds = {
	LOW: 1 / 3,
	MEDIUM: 2 / 3,
} as const;

const colorMap = {
	LOW: twConfig.theme.colors.green[700],
	MEDIUM: twConfig.theme.colors.orange[500],
	HIGH: twConfig.theme.colors.red[500],
} as const;

export const UsageProgressBar = ({ value, max, "aria-label": ariaLabel, className = "" }: UsageProgressBarProps) => {
	const chartRef = useRef<HTMLDivElement>(null);
	const chartInstance = useRef<ApexCharts | null>(null);
	const isInitialized = useRef(false);
	const { addToast } = useToastStore();
	const { t } = useTranslation("billing");

	const chartData = useMemo(() => {
		const percent = Math.min(100, Math.round((value / max) * 100));
		const normalizedValue = value / max;

		let color: string;
		if (normalizedValue <= colorThresholds.LOW) {
			color = colorMap.LOW;
		} else if (normalizedValue <= colorThresholds.MEDIUM) {
			color = colorMap.MEDIUM;
		} else {
			color = colorMap.HIGH;
		}

		return { percent, color };
	}, [value, max]);

	const chartOptions = useMemo(
		() => ({
			chart: {
				type: "radialBar" as const,
				height: 200,
				animations: {
					enabled: true,
					easing: "easeinout",
					speed: 800,
				},
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
							formatter: () => `${formatNumberWithEllipsis(value)} / ${formatNumberWithEllipsis(max)}`,
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
					gradientToColors: [chartData.color],
					inverseColors: true,
					opacityFrom: 1,
					opacityTo: 1,
					stops: [0, 100],
				},
			},
			colors: [chartData.color],
			stroke: {
				lineCap: "round" as const,
			},
			states: {
				hover: {
					filter: {
						type: "none",
					},
				},
				active: {
					filter: {
						type: "none",
					},
				},
			},
			accessibility: {
				enabled: true,
				description:
					ariaLabel ||
					t("usageProgressBar.usageAria", {
						value: formatNumberWithEllipsis(value),
						max: formatNumberWithEllipsis(max),
					}),
			},
		}),
		[chartData.color, value, max, ariaLabel, t]
	);

	const updateChart = useCallback(() => {
		if (!chartInstance.current) return;

		try {
			chartInstance.current.updateSeries([chartData.percent]);

			chartInstance.current.updateOptions(
				{
					colors: [chartData.color],
					fill: {
						...chartOptions.fill,
						gradient: {
							...chartOptions.fill.gradient,
							gradientToColors: [chartData.color],
						},
					},
				},
				false,
				false
			);
		} catch (error) {
			addToast({
				message: t("failedToCalculateUsageChart", { error }),
				type: "error",
			});
			initializeChart();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chartData.percent, chartData.color, chartOptions.fill]);

	const initializeChart = useCallback(() => {
		if (!chartRef.current) return;

		try {
			if (chartInstance.current) {
				chartInstance.current.destroy();
			}

			chartInstance.current = new ApexCharts(chartRef.current, {
				...chartOptions,
				series: [chartData.percent],
			});

			chartInstance.current.render();
			isInitialized.current = true;
		} catch (error) {
			LoggerService.error(namespaces.ui.billing, t("failedInitializeBillingProjectsChart", { error }));
			isInitialized.current = false;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chartOptions, chartData.percent]);

	useEffect(() => {
		if (!isInitialized.current) {
			initializeChart();
		} else {
			updateChart();
		}
	}, [initializeChart, updateChart]);

	useEffect(() => {
		return () => {
			if (chartInstance.current) {
				try {
					chartInstance.current.destroy();
				} catch (error) {
					LoggerService.error(namespaces.ui.billing, t("failedDestroyingBillingProjectsChart", { error }));
				}
				chartInstance.current = null;
				isInitialized.current = false;
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			aria-label={
				ariaLabel ||
				t("usageProgressBar.usageProgress", {
					value: formatNumberWithEllipsis(value),
					max: formatNumberWithEllipsis(max),
				})
			}
			className={`flex flex-col items-center justify-center ${className}`}
			role="img"
		>
			<div aria-hidden="true" className="w-full" ref={chartRef} />
			<span className="sr-only">
				{t("usageProgressBar.usage", {
					value: formatNumberWithEllipsis(value),
					max: formatNumberWithEllipsis(max),
					percent: chartData.percent,
				})}
			</span>
		</div>
	);
};
