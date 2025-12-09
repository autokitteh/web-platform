import { DonutChart, Legend } from "@tremor/react";

import { sessionStatusColors, sessionStatusLabels, SessionStatus } from "@constants";

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
			<DonutChart
				aria-label="Session status distribution"
				category="value"
				colors={colors}
				data={chartData}
				index="name"
				showAnimation
				valueFormatter={(value) => `${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`}
			/>
			{showLegend ? (
				<Legend categories={chartData.map((d) => d.name)} className="mt-4 justify-center" colors={colors} />
			) : null}
		</div>
	);
};
