import { AreaChart } from "@tremor/react";

import { sessionStatusColors, sessionStatusLabels } from "@constants";

interface SessionsOverTimeData {
	date: string;
	completed: number;
	error: number;
	running: number;
	stopped: number;
}

interface SessionsOverTimeChartProps {
	data: SessionsOverTimeData[];
	className?: string;
}

export const SessionsOverTimeChart = ({ data, className }: SessionsOverTimeChartProps) => {
	const categories = ["completed", "error", "running", "stopped"] as const;
	const colors = categories.map((cat) => sessionStatusColors[cat]);

	const formattedData = data.map((item) => ({
		date: item.date,
		[sessionStatusLabels.completed]: item.completed,
		[sessionStatusLabels.error]: item.error,
		[sessionStatusLabels.running]: item.running,
		[sessionStatusLabels.stopped]: item.stopped,
	}));

	return (
		<AreaChart
			aria-label="Sessions over time"
			categories={categories.map((cat) => sessionStatusLabels[cat])}
			className={className}
			colors={colors}
			data={formattedData}
			index="date"
			showAnimation
			showLegend
			stack
			yAxisWidth={48}
		/>
	);
};
