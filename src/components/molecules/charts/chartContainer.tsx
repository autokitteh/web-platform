import { Card, Title, Text } from "@tremor/react";

import { ChartContainerProps } from "@interfaces/components/dashboardStats.interface";
import { cn } from "@utilities";

import { ErrorState } from "@components/atoms/errorState";

const ChartSkeleton = () => (
	<div className="animate-pulse">
		<div className="mb-4 h-4 w-32 rounded bg-gray-200" />
		<div className="h-64 w-full rounded bg-gray-100" />
	</div>
);

export const ChartContainer = ({
	title,
	subtitle,
	children,
	isLoading = false,
	error,
	onRetry,
	controls,
	className,
}: ChartContainerProps) => {
	if (error) {
		return (
			<Card className={className}>
				<ErrorState message={error} onRetry={onRetry} />
			</Card>
		);
	}

	return (
		<Card className={cn("relative", className)}>
			<div className="mb-4 flex items-start justify-between">
				<div>
					<Title>{title}</Title>
					{subtitle ? <Text className="mt-1">{subtitle}</Text> : null}
				</div>
				{controls ? <div className="flex items-center gap-2">{controls}</div> : null}
			</div>
			{isLoading ? <ChartSkeleton /> : children}
		</Card>
	);
};
