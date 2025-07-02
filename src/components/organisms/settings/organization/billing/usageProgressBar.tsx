import React from "react";

import { HalfCircleProgressBarProps } from "@src/interfaces/components";

export const UsageProgressBar = ({ value, max }: HalfCircleProgressBarProps) => {
	const percent = Math.min(100, Math.round((value / max) * 100));
	const radius = 80;
	const stroke = 14;
	const normalizedRadius = radius - stroke / 2;
	const circumference = Math.PI * normalizedRadius;

	const firstThird = max / 3;
	const secondThird = (2 * max) / 3;

	let color = "#22c55e";
	if (value > secondThird) {
		color = "#ef4444";
	} else if (value > firstThird) {
		color = "#f59e42";
	}

	const progress = (percent / 100) * circumference;

	return (
		<div className="flex flex-col items-center justify-center">
			<svg
				className="block"
				height={radius + stroke}
				viewBox={`0 0 ${radius * 2} ${radius + stroke}`}
				width={radius * 2}
			>
				<path
					d={`M${stroke / 2},${radius} A${normalizedRadius},${normalizedRadius} 0 0,1 ${radius * 2 - stroke / 2},${radius}`}
					fill="none"
					stroke="#e5e7eb"
					strokeWidth={stroke}
				/>
				<path
					d={`M${stroke / 2},${radius} A${normalizedRadius},${normalizedRadius} 0 0,1 ${radius * 2 - stroke / 2},${radius}`}
					fill="none"
					stroke={color}
					strokeDasharray={circumference}
					strokeDashoffset={circumference - progress}
					strokeWidth={stroke}
					style={{ transition: "stroke-dashoffset 0.5s" }}
				/>
			</svg>
			<div className="mt-1 text-center">
				<span className="text-lg font-semibold text-white">
					{value} / {max}
				</span>
			</div>
		</div>
	);
};
