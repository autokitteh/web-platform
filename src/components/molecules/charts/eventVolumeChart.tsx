import { AreaChart } from "@tremor/react";

import { triggerTypeColors, triggerTypeLabels } from "@constants";

interface EventVolumeData {
	date: string;
	total: number;
	connection?: number;
	webhook?: number;
	cron?: number;
	manual?: number;
}

interface EventVolumeChartProps {
	data: EventVolumeData[];
	className?: string;
	showByType?: boolean;
}

export const EventVolumeChart = ({ data, className, showByType = false }: EventVolumeChartProps) => {
	if (showByType) {
		const categories = ["connection", "webhook", "cron", "manual"] as const;
		const colors = categories.map((cat) => triggerTypeColors[cat]);

		const formattedData = data.map((item) => ({
			date: item.date,
			[triggerTypeLabels.connection]: item.connection || 0,
			[triggerTypeLabels.webhook]: item.webhook || 0,
			[triggerTypeLabels.cron]: item.cron || 0,
			[triggerTypeLabels.manual]: item.manual || 0,
		}));

		return (
			<AreaChart
				aria-label="Event volume by type over time"
				categories={categories.map((cat) => triggerTypeLabels[cat])}
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
	}

	const formattedData = data.map((item) => ({
		date: item.date,
		Events: item.total,
	}));

	return (
		<AreaChart
			aria-label="Event volume over time"
			categories={["Events"]}
			className={className}
			colors={["blue"]}
			data={formattedData}
			index="date"
			showAnimation
			showLegend={false}
			yAxisWidth={48}
		/>
	);
};
