import { QuickActions } from "./quickActions";
import { cn } from "@utilities";

import { Button } from "@components/atoms/buttons";

import { RotateRightIcon } from "@assets/image/icons";

interface DashboardHeaderProps {
	title: string;
	onRefresh?: () => void;
	isRefreshing?: boolean;
	lastUpdated?: string;
	className?: string;
}

export const DashboardHeader = ({
	title = "Projects",
	onRefresh,
	isRefreshing = false,
	lastUpdated,
	className,
}: DashboardHeaderProps) => (
	<div className={cn("mx-6 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
		<div>
			<h1 className="pl-4 text-2xl font-bold text-white">{title}</h1>
		</div>
		<div>
			<QuickActions />
		</div>
		<div className="flex items-center gap-3">
			{lastUpdated ? <span className="text-xs text-gray-500">Updated: {lastUpdated}</span> : null}

			{onRefresh ? (
				<Button aria-label="Refresh dashboard" disabled={isRefreshing} onClick={onRefresh} variant="outline">
					<RotateRightIcon
						className={cn("group size-4 rounded-full fill-green-800", isRefreshing && "animate-spin")}
					/>
				</Button>
			) : null}
		</div>
	</div>
);
