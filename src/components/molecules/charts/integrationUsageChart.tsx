import { BarChart } from "@tremor/react";

interface IntegrationUsageData {
	integration: string;
	connectionCount: number;
	eventsTriggered: number;
}

interface IntegrationUsageChartProps {
	data: IntegrationUsageData[];
	className?: string;
}

export const IntegrationUsageChart = ({ data, className }: IntegrationUsageChartProps) => {
	const chartData = data
		.sort((a, b) => b.eventsTriggered - a.eventsTriggered)
		.slice(0, 6)
		.map((item) => ({
			name: item.integration,
			Events: item.eventsTriggered,
			Connections: item.connectionCount,
		}));

	return (
		<BarChart
			aria-label="Integration usage"
			categories={["Events"]}
			className={className}
			colors={["blue"]}
			data={chartData}
			index="name"
			layout="vertical"
			showAnimation
			showLegend={false}
			valueFormatter={(value) => value.toLocaleString()}
			yAxisWidth={100}
		/>
	);
};
