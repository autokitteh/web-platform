import React from "react";

import { useTranslation } from "react-i18next";

import { UsageProgressBarProps } from "@src/interfaces/components";
import { formatNumberWithEllipsis } from "@src/utilities";

const colorThresholds = {
	LOW: 1 / 3,
	MEDIUM: 2 / 3,
} as const;

export const UsageProgressBar = ({ value, max, "aria-label": ariaLabel, className = "" }: UsageProgressBarProps) => {
	const { t } = useTranslation("billing");

	const percent = Math.min(100, Math.round((value / max) * 100));
	const normalizedValue = value / max;

	let colorClasses: string;
	if (normalizedValue <= colorThresholds.LOW) {
		colorClasses = "bg-green-700";
	} else if (normalizedValue <= colorThresholds.MEDIUM) {
		colorClasses = "bg-orange-500";
	} else {
		colorClasses = "bg-red-500";
	}

	return (
		<div
			aria-label={
				ariaLabel ||
				t("usageProgressBar.usageProgress", {
					value: formatNumberWithEllipsis(value),
					max: formatNumberWithEllipsis(max),
				})
			}
			className={`flex w-full flex-col items-center justify-center space-y-3 ${className}`}
			role="img"
		>
			<div className="relative flex size-24 items-center justify-center">
				<svg className="size-24 -rotate-90" viewBox="0 0 100 100">
					<circle
						className="text-gray-800"
						cx="50"
						cy="50"
						fill="transparent"
						r="40"
						stroke="currentColor"
						strokeWidth="8"
					/>
					<circle
						className={`transition-all duration-500 ease-in-out ${
							normalizedValue <= colorThresholds.LOW
								? "text-green-700"
								: normalizedValue <= colorThresholds.MEDIUM
									? "text-orange-500"
									: "text-red-500"
						}`}
						cx="50"
						cy="50"
						fill="transparent"
						r="40"
						stroke="currentColor"
						strokeDasharray={`${percent * 2.51} 251.2`}
						strokeLinecap="round"
						strokeWidth="8"
					/>
				</svg>

				<div className="absolute inset-0 flex items-center justify-center">
					<span className="text-lg font-semibold text-white">{percent}%</span>
				</div>
			</div>

			<div className="flex flex-col items-center space-y-1 text-center">
				<div className="text-sm font-medium text-white">
					{formatNumberWithEllipsis(value)} / {formatNumberWithEllipsis(max)}
				</div>

				<div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-800">
					<div
						className={`h-full transition-all duration-500 ease-in-out ${colorClasses}`}
						style={{ width: `${percent}%` }}
					/>
				</div>
			</div>

			<span className="sr-only">
				{t("usageProgressBar.usage", {
					value: formatNumberWithEllipsis(value),
					max: formatNumberWithEllipsis(max),
					percent,
				})}
			</span>
		</div>
	);
};
