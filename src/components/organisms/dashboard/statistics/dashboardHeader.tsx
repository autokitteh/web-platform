import { DashboardTimeRange } from "@constants";
import { cn } from "@utilities";

import { Button } from "@components/atoms/buttons";
import { TimeRangeSelector } from "@components/molecules/charts/timeRangeSelector";

import { RotateRightIcon } from "@assets/image/icons";

interface DashboardHeaderProps {
	title: string;
	subtitle?: string;
	timeRange: DashboardTimeRange;
	onTimeRangeChange: (value: DashboardTimeRange) => void;
	onRefresh?: () => void;
	isRefreshing?: boolean;
	lastUpdated?: string;
	className?: string;
}

export const DashboardHeader = ({
	title,
	subtitle,
	timeRange,
	onTimeRangeChange,
	onRefresh,
	isRefreshing = false,
	lastUpdated,
	className,
}: DashboardHeaderProps) => (
	<div className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
		<div>
			<h1 className="text-2xl font-bold text-white">{title}</h1>
			{subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
		</div>
		<div className="flex items-center gap-3">
			{lastUpdated ? <span className="text-xs text-gray-500">Updated: {lastUpdated}</span> : null}
			<TimeRangeSelector onChange={onTimeRangeChange} value={timeRange} />
			{onRefresh ? (
				<Button aria-label="Refresh dashboard" disabled={isRefreshing} onClick={onRefresh} variant="outline">
					<RotateRightIcon className={cn("size-4", isRefreshing && "animate-spin")} />
				</Button>
			) : null}
		</div>
	</div>
);
