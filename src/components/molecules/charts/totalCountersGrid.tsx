import { TotalCountersData } from "@interfaces/components";
import { cn } from "@utilities";

interface TotalCountersGridProps {
	data: TotalCountersData;
	isLoading?: boolean;
	className?: string;
}

interface CounterCardProps {
	label: string;
	value: number;
	subValue?: string;
	accentColor?: string;
	isLoading?: boolean;
}

const accentColors = {
	blue: "#3b82f6",
	green: "#86D13F",
	amber: "#f59e0b",
	cyan: "#06b6d4",
} as const;

const CounterCard = ({ label, value, subValue, accentColor, isLoading }: CounterCardProps) => {
	if (isLoading) {
		return (
			<div className="animate-pulse rounded-lg border border-gray-1050 bg-gray-1200 p-4">
				<div className="mb-2 h-3 w-20 rounded bg-gray-1050" />
				<div className="h-8 w-16 rounded bg-gray-1050" />
			</div>
		);
	}

	return (
		<div className="group relative overflow-hidden rounded-lg border border-gray-1050 bg-gray-1200 p-4 transition-all hover:border-gray-950">
			{accentColor ? (
				<div className="absolute left-0 top-0 h-full w-0.5" style={{ backgroundColor: accentColor }} />
			) : null}
			<p className="font-fira-sans text-xs uppercase tracking-wider text-gray-600">{label}</p>
			<p className="mt-1 font-fira-code text-2xl font-medium tabular-nums text-white">{value.toLocaleString()}</p>
			{subValue ? <p className="mt-0.5 font-fira-code text-xs text-gray-500">{subValue}</p> : null}
		</div>
	);
};

export const TotalCountersGrid = ({ data, isLoading = false, className }: TotalCountersGridProps) => {
	const totalSessions = Object.values(data.sessionsByStatus).reduce((sum, count) => sum + count, 0);

	return (
		<div className={cn("space-y-4", className)}>
			<div className="flex items-center justify-between">
				<h3 className="font-fira-sans text-sm font-medium uppercase tracking-widest text-gray-500">
					System Overview
				</h3>
				<div className="ml-4 h-px flex-1 bg-gradient-to-r from-gray-1050 to-transparent" />
			</div>

			<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				<CounterCard
					accentColor={accentColors.blue}
					isLoading={isLoading}
					label="Total Projects"
					subValue={`${data.activeProjects} active`}
					value={data.totalProjects}
				/>
				<CounterCard
					accentColor={accentColors.green}
					isLoading={isLoading}
					label="Active Projects"
					subValue={`${Math.round((data.activeProjects / data.totalProjects) * 100)}% of total`}
					value={data.activeProjects}
				/>
				<CounterCard
					accentColor={accentColors.amber}
					isLoading={isLoading}
					label="Total Deployments"
					subValue={`${data.activeDeployments} active`}
					value={data.totalDeployments}
				/>
				<CounterCard
					accentColor={accentColors.cyan}
					isLoading={isLoading}
					label="Total Sessions"
					subValue="all time"
					value={totalSessions}
				/>
			</div>
		</div>
	);
};
