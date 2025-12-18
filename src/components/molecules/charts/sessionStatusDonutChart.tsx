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
}

export const SessionStatusDonutChart = ({ data, className, showLegend = true }: SessionStatusDonutChartProps) => {
	const chartData = data.map((item) => ({
		name: sessionStatusLabels[item.status],
		value: item.count,
	}));

	const colors = data.map((item) => sessionStatusColors[item.status]);

	const total = data.reduce((sum, item) => sum + item.count, 0);

	return (
		<div className={className}>
			<div className="flex h-full items-center justify-center gap-6">
				<div className="w-40 shrink-0">
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
					<div className="flex flex-col gap-3">
						{data.map((item) => (
							<div className="flex items-center gap-2" key={item.status}>
								<span
									className="size-2.5 rounded-full"
									style={{ backgroundColor: sessionStatusHex[item.status] }}
								/>
								<span className="font-fira-sans text-xs text-gray-400">
									{sessionStatusLabels[item.status]}
								</span>
								<span className="font-fira-code text-sm font-medium tabular-nums text-white">
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
