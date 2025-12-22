import { CounterCard } from "./counterCard";
import { TotalCountersData } from "@interfaces/components";
import { cn } from "@utilities";

interface TotalCountersGridProps {
	data: TotalCountersData;
	isLoading?: boolean;
	className?: string;
}

const accentColors = {
	blue: "#3b82f6",
	green: "#86D13F",
	amber: "#f59e0b",
	cyan: "#06b6d4",
} as const;

export const TotalCountersGrid = ({ data, isLoading = false, className }: TotalCountersGridProps) => {
	const totalSessions = Object.values(data.sessionsByStatus).reduce((sum, count) => sum + count, 0);

	return (
		<div className={cn("space-y-2 sm:space-y-4", className)}>
			<div className="hidden items-center justify-between sm:flex">
				<h3 className="font-fira-sans text-xs font-medium uppercase tracking-widest text-gray-500 sm:text-sm">
					System Overview
				</h3>
				<div className="ml-4 h-px flex-1 bg-gradient-to-r from-gray-1050 to-transparent" />
			</div>

			<div className="grid grid-cols-2 gap-2 sm:gap-3">
				<CounterCard
					accentColor={accentColors.blue}
					isLoading={isLoading}
					label="Projects"
					subValue={`${data.activeProjects} active`}
					value={data.totalProjects}
				/>
				<CounterCard
					accentColor={accentColors.green}
					isLoading={isLoading}
					label="Active Projects"
					subValue={`${data.totalProjects > 0 ? Math.round((data.activeProjects / data.totalProjects) * 100) : 0}% of total`}
					value={data.activeProjects}
				/>
				<CounterCard
					accentColor={accentColors.amber}
					isLoading={isLoading}
					label="Deployments"
					subValue={`${data.activeDeployments} active`}
					value={data.totalDeployments}
				/>
				<CounterCard
					accentColor={accentColors.cyan}
					isLoading={isLoading}
					label="Sessions"
					subValue="all time"
					value={totalSessions}
				/>
			</div>
		</div>
	);
};
