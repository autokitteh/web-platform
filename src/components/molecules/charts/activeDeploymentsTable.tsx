import { Link } from "react-router-dom";

import { SidebarHrefMenu } from "@enums/components";
import { ActiveDeploymentData } from "@store/useDashboardStatisticsStore";
import { cn } from "@utilities";

interface ActiveDeploymentsTableProps {
	data: ActiveDeploymentData[];
	isLoading?: boolean;
	className?: string;
}

const formatDate = (date?: Date): string => {
	if (!date) return "N/A";
	return new Date(date).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const TableSkeleton = () => (
	<div className="animate-pulse space-y-2">
		{Array.from({ length: 3 }, (_, i) => (
			<div className="flex items-center gap-4 rounded-lg bg-gray-1200 p-3" key={i}>
				<div className="h-4 w-32 rounded bg-gray-1050" />
				<div className="h-4 w-24 rounded bg-gray-1050" />
				<div className="flex-1" />
				<div className="h-4 w-28 rounded bg-gray-1050" />
			</div>
		))}
	</div>
);

export const ActiveDeploymentsTable = ({ data, isLoading = false, className }: ActiveDeploymentsTableProps) => {
	if (isLoading) {
		return <TableSkeleton />;
	}

	if (data.length === 0) {
		return (
			<div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-gray-1050">
				<p className="font-fira-sans text-sm text-gray-600">No active deployments</p>
			</div>
		);
	}

	return (
		<div className={cn("space-y-1", className)}>
			{data.map((deployment) => (
				<Link
					className="group flex items-center gap-4 rounded-lg border border-gray-1050 bg-gray-1200 p-3 transition-all hover:border-gray-950 hover:bg-gray-1150"
					key={deployment.deploymentId}
					to={`/${SidebarHrefMenu.projects}/${deployment.projectId}/deployments/${deployment.deploymentId}/sessions`}
				>
					<div className="min-w-0 flex-1">
						<p className="truncate font-fira-sans text-sm font-medium text-white group-hover:text-green-800">
							{deployment.projectName}
						</p>
						<p className="mt-0.5 font-fira-code text-xs text-gray-600">
							{deployment.deploymentId.slice(0, 20)}...
						</p>
					</div>

					<div className="text-right">
						<p className="font-fira-sans text-xs text-gray-500">Deployed</p>
						<p className="font-fira-code text-sm tabular-nums text-gray-300">
							{formatDate(deployment.createdAt)}
						</p>
					</div>
				</Link>
			))}
		</div>
	);
};
