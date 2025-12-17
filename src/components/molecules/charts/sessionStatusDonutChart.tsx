import { DonutChart } from "@tremor/react";

import { sessionStatusLabels, SessionStatus } from "@constants";
import { ActivityState } from "@constants/activities.constants";

interface SessionStatusData {
	status: SessionStatus;
	count: number;
}

interface SessionStatusDonutChartProps {
	data: SessionStatusData[];
	className?: string;
	showLegend?: boolean;
}

const sessionStateColors: Record<SessionStatus, string> = {
	[ActivityState.running]: "#3b82f6",
	[ActivityState.completed]: "#86D13F",
	[ActivityState.error]: "#FF6B61",
	[ActivityState.stopped]: "#f59e0b",
	[ActivityState.created]: "#bec3d1",
	[ActivityState.unspecified]: "#bec3d1",
};

const sessionStateTremorColors: Record<SessionStatus, string> = {
	[ActivityState.running]: "blue",
	[ActivityState.completed]: "green",
	[ActivityState.error]: "red",
	[ActivityState.stopped]: "amber",
	[ActivityState.created]: "gray",
	[ActivityState.unspecified]: "gray",
};

export const SessionStatusDonutChart = ({ data, className, showLegend = true }: SessionStatusDonutChartProps) => {
	const chartData = data.map((item) => ({
		name: sessionStatusLabels[item.status],
		value: item.count,
	}));

	const colors = data.map((item) => sessionStateTremorColors[item.status]);

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
									style={{ backgroundColor: sessionStateColors[item.status] }}
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
