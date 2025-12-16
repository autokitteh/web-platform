import { SessionCountersMini } from "./sessionCountersMini";
import { cn } from "@utilities";
import { DeploymentStatsData } from "@utilities/fakeDashboardData";

interface DeploymentStatsTableProps {
	data: DeploymentStatsData[];
	isLoading?: boolean;
	className?: string;
}

const TableSkeleton = () => (
	<div className="animate-pulse space-y-3">
		{Array.from({ length: 4 }, (_, i) => (
			<div className="flex items-center gap-4 rounded-lg bg-gray-1200 p-3" key={i}>
				<div className="h-4 w-32 rounded bg-gray-1050" />
				<div className="h-4 w-20 rounded bg-gray-1050" />
				<div className="flex-1" />
				<div className="h-6 w-24 rounded bg-gray-1050" />
			</div>
		))}
	</div>
);

export const DeploymentStatsTable = ({ data, isLoading = false, className }: DeploymentStatsTableProps) => {
	if (isLoading) {
		return <TableSkeleton />;
	}

	if (data.length === 0) {
		return (
			<div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-1050">
				<p className="font-fira-sans text-sm text-gray-600">No deployments found</p>
			</div>
		);
	}

	return (
		<div className={cn("space-y-1", className)}>
			{data.map((deployment) => (
				<div
					className="group flex items-center gap-4 rounded-lg border border-gray-1050 bg-gray-1200 p-3 transition-all hover:border-gray-950 hover:bg-gray-1150"
					key={deployment.deploymentId}
				>
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<p className="truncate font-fira-sans text-sm font-medium text-white">
								{deployment.projectName}
							</p>
							<span className="font-fira-code text-xs text-gray-600">
								{deployment.deploymentId.slice(0, 12)}
							</span>
						</div>
						<p className="mt-0.5 font-fira-code text-xs text-gray-600">
							Last activity: {deployment.lastActivity}
						</p>
					</div>

					<div className="flex items-center gap-3">
						<div className="text-right">
							<p className="font-fira-code text-lg font-medium tabular-nums text-white">
								{deployment.totalSessions}
							</p>
							<p className="font-fira-sans text-xs text-gray-600">sessions</p>
						</div>

						<div className="hidden h-8 w-px bg-gray-1050 lg:block" />

						<div className="hidden lg:block">
							<SessionCountersMini
								completed={deployment.completedSessions}
								error={deployment.errorSessions}
								running={deployment.runningSessions}
								size="sm"
								stopped={deployment.stoppedSessions}
							/>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};
