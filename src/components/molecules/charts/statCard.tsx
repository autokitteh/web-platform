import { Card, Metric, Text } from "@tremor/react";

import { cn } from "@utilities";

interface StatCardProps {
	title: string;
	value: string | number;
	delta?: number;
	deltaLabel?: string;
	isLoading?: boolean;
	className?: string;
}

export const StatCard = ({ title, value, delta, deltaLabel, isLoading = false, className }: StatCardProps) => {
	const getDeltaColor = () => {
		if (delta === undefined || delta === 0) return "text-gray-500";

		return delta > 0 ? "text-green-700" : "text-red-500";
	};

	const getDeltaPrefix = () => {
		if (delta === undefined || delta === 0) return "";

		return delta > 0 ? "+" : "";
	};

	if (isLoading) {
		return (
			<Card className={cn("animate-pulse", className)}>
				<div className="mb-2 h-4 w-24 rounded bg-gray-200" />
				<div className="mb-2 h-8 w-16 rounded bg-gray-200" />
				<div className="h-3 w-20 rounded bg-gray-200" />
			</Card>
		);
	}

	return (
		<Card className={className}>
			<Text>{title}</Text>
			<Metric>{value}</Metric>
			{delta !== undefined ? (
				<Text className={cn("mt-1", getDeltaColor())}>
					{getDeltaPrefix()}
					{delta}
					{deltaLabel ? ` ${deltaLabel}` : ""}
				</Text>
			) : null}
		</Card>
	);
};
