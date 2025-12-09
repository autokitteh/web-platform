import { BarChart } from "@tremor/react";

import { triggerTypeColors, triggerTypeLabels, TriggerType } from "@constants";

interface EventsByTriggerData {
	triggerType: TriggerType;
	count: number;
	percentage: number;
}

interface EventsByTriggerChartProps {
	data: EventsByTriggerData[];
	className?: string;
}

export const EventsByTriggerChart = ({ data, className }: EventsByTriggerChartProps) => {
	const chartData = data.map((item) => ({
		name: triggerTypeLabels[item.triggerType],
		Events: item.count,
		percentage: item.percentage,
	}));

	const colors = data.map((item) => triggerTypeColors[item.triggerType]);

	return (
		<BarChart
			aria-label="Events by trigger type"
			categories={["Events"]}
			className={className}
			colors={colors}
			data={chartData}
			index="name"
			layout="vertical"
			showAnimation
			showLegend={false}
			valueFormatter={(value) => `${value.toLocaleString()}`}
			yAxisWidth={80}
		/>
	);
};
