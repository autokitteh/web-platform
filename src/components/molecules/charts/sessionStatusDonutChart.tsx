import { DonutChart } from "@tremor/react";

import { sessionStatusColors, sessionStatusHex, sessionStatusLabels, SessionStatus } from "@constants";

interface SessionStatusData {
	status: SessionStatus;
	count: number;
}

interface SessionStatusDonutChartProps {
	data: SessionStatusData[];
	className?: string;
	showLegend?: boolean;
	isLoading?: boolean;
}

export const SessionStatusDonutChart = ({
	data,
	className,
	showLegend = true,
	isLoading = false,
}: SessionStatusDonutChartProps) => {
	if (isLoading) {
		return (
			<div className={className}>
				<div className="flex h-full animate-pulse flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
					<div className="size-24 shrink-0 rounded-full bg-gray-1050 sm:size-40" />
					{showLegend ? (
						<div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 sm:flex-col sm:gap-3">
							{[1, 2, 3, 4, 5].map((i) => (
								<div className="flex items-center gap-1.5 sm:gap-2" key={i}>
									<span className="size-2 shrink-0 rounded-full bg-gray-1050 sm:size-2.5" />
									<span className="h-3 w-12 rounded bg-gray-1050 sm:w-16" />
									<span className="h-4 w-6 rounded bg-gray-1050 sm:w-8" />
								</div>
							))}
						</div>
					) : null}
				</div>
			</div>
		);
	}
	const chartData = data.map((item) => ({
		name: sessionStatusLabels[item.status],
		value: item.count,
	}));

	const colors = data.map((item) => sessionStatusColors[item.status]);

	const total = data.reduce((sum, item) => sum + item.count, 0);

	return (
		<div className={className}>
			<div className="flex h-full flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
				<div className="w-24 shrink-0 sm:w-40">
					<DonutChart
						aria-label="Session status distribution"
						category="value"
						colors={colors}
						data={chartData}
						index="name"
						showAnimation
						valueFormatter={(value) => `${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`}
					/>
				</div>
				{showLegend ? (
					<div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 sm:flex-col sm:gap-3">
						{data.map((item) => (
							<div className="flex items-center gap-1.5 sm:gap-2" key={item.status}>
								<span
									className="size-2 shrink-0 rounded-full sm:size-2.5"
									style={{ backgroundColor: sessionStatusHex[item.status] }}
								/>
								<span className="font-fira-sans text-10 text-gray-400 sm:text-xs">
									{sessionStatusLabels[item.status]}
								</span>
								<span className="font-fira-code text-xs font-medium tabular-nums text-white sm:text-sm">
									{item.count.toLocaleString()}
								</span>
							</div>
						))}
					</div>
				) : null}
			</div>
		</div>
	);
};
