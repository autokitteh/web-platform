import { ChartContainerProps } from "@interfaces/components/dashboardStats.interface";
import { cn } from "@utilities";

import { ErrorState } from "@components/atoms/errorState";

const ChartSkeleton = () => (
	<div className="animate-pulse">
		<div className="mb-4 h-4 w-32 rounded bg-gray-1050" />
		<div className="h-64 w-full rounded bg-gray-1050" />
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
			<div className={cn("rounded-xl border border-gray-1050 bg-gray-1200 p-6", className)}>
				<ErrorState message={error} onRetry={onRetry} />
			</div>
		);
	}

	return (
		<div className={cn("relative rounded-xl border border-gray-1050 bg-gray-1200 p-6", className)}>
			<div className="mb-4 flex items-start justify-between">
				<div>
					<h3 className="text-lg font-semibold text-white">{title}</h3>
					{subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
				</div>
				{controls ? <div className="flex items-center gap-2">{controls}</div> : null}
			</div>
			{isLoading ? <ChartSkeleton /> : children}
		</div>
	);
};
