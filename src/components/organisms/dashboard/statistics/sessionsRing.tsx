import React from "react";

import { sessionStatusHex, sessionStatusLabels, SessionStatus } from "@constants";
import { cn } from "@utilities";

interface SessionStatusData {
	status: SessionStatus;
	count: number;
}

interface SessionsRingProps {
	data: SessionStatusData[];
	isLoading?: boolean;
	className?: string;
}

const RingSkeleton = () => (
	<div className="flex items-center justify-center gap-8">
		<div className="relative size-44">
			<div className="absolute inset-0 animate-pulse rounded-full border-8 border-gray-1050" />
		</div>
		<div className="space-y-3">
			{Array.from({ length: 4 }).map((_, i) => (
				<div className="flex items-center gap-3" key={i}>
					<div className="size-3 animate-pulse rounded-full bg-gray-1050" />
					<div className="h-4 w-20 animate-pulse rounded bg-gray-1050" />
				</div>
			))}
		</div>
	</div>
);

export const SessionsRing = ({ data, isLoading = false, className }: SessionsRingProps) => {
	if (isLoading) {
		return (
			<div className={cn("rounded-2xl bg-gray-1200 p-6", className)}>
				<div className="mb-6 h-6 w-36 animate-pulse rounded bg-gray-1050" />
				<RingSkeleton />
			</div>
		);
	}

	const total = data.reduce((sum, item) => sum + item.count, 0);
	const ringSize = 176;
	const strokeWidth = 20;
	const radius = (ringSize - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;

	let currentOffset = 0;
	const segments = data
		.filter((item) => item.count > 0)
		.map((item) => {
			const percentage = (item.count / total) * 100;
			const dashLength = (percentage / 100) * circumference;
			const dashOffset = -currentOffset;
			currentOffset += dashLength;

			return {
				...item,
				percentage,
				dashLength,
				dashOffset,
				color: sessionStatusHex[item.status],
			};
		});

	return (
		<div className={cn("rounded-2xl bg-gray-1200 p-6", className)}>
			<div className="mb-6 flex items-center justify-between">
				<h3 className="text-lg font-semibold text-white">Session Overview</h3>
				<span className="text-sm text-gray-500">{total.toLocaleString()} total</span>
			</div>

			<div className="flex items-center justify-center gap-8">
				<div className="relative" style={{ width: ringSize, height: ringSize }}>
					<svg className="-rotate-90" height={ringSize} width={ringSize}>
						<circle
							className="text-gray-1050"
							cx={ringSize / 2}
							cy={ringSize / 2}
							fill="none"
							r={radius}
							stroke="currentColor"
							strokeWidth={strokeWidth}
						/>

						{segments.map((segment, index) => (
							<circle
								cx={ringSize / 2}
								cy={ringSize / 2}
								fill="none"
								key={segment.status}
								r={radius}
								stroke={segment.color}
								strokeDasharray={`${segment.dashLength} ${circumference - segment.dashLength}`}
								strokeDashoffset={segment.dashOffset}
								strokeLinecap="round"
								strokeWidth={strokeWidth}
								style={{
									transition: "stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease",
									transitionDelay: `${index * 100}ms`,
								}}
							/>
						))}
					</svg>

					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<span className="text-3xl font-bold text-white">{total}</span>
						<span className="text-xs text-gray-500">Sessions</span>
					</div>
				</div>

				<div className="space-y-3">
					{data.map((item) => {
						const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";

						return (
							<div className="flex items-center gap-3" key={item.status}>
								<span
									className="size-3 rounded-full"
									style={{ backgroundColor: sessionStatusHex[item.status] }}
								/>
								<div className="flex items-center gap-2">
									<span className="text-sm text-white">{sessionStatusLabels[item.status]}</span>
									<span className="text-xs text-gray-500">
										{item.count} ({percentage}%)
									</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
