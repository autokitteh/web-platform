import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { SidebarHrefMenu } from "@enums/components";
import { ActiveDeploymentData } from "@type/stores";
import { cn, formatDate } from "@utilities";

import { TableSkeleton } from "@components/atoms";

interface ActiveDeploymentsTableProps {
	data: ActiveDeploymentData[];
	isLoading?: boolean;
	className?: string;
}

export const ActiveDeploymentsTable = ({ data, isLoading = false, className }: ActiveDeploymentsTableProps) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects.table" });

	if (isLoading) {
		return <TableSkeleton rows={3} variant="compact" />;
	}

	if (data.length === 0) {
		return (
			<div className="flex h-16 items-center justify-center rounded-lg border border-dashed border-gray-1050 sm:h-24">
				<p className="font-fira-sans text-xs text-gray-600 sm:text-sm">{t("noActiveDeployments")}</p>
			</div>
		);
	}

	return (
		<div className={cn("mt-8 space-y-1 sm:mt-0", className)}>
			{data.map((deployment) => (
				<Link
					className="group flex items-center gap-2 rounded-lg border border-gray-1050 bg-gray-1200 p-2 transition-all hover:border-gray-950 hover:bg-gray-1150 sm:gap-4 sm:p-3"
					key={deployment.deploymentId}
					to={`/${SidebarHrefMenu.projects}/${deployment.projectId}/deployments/${deployment.deploymentId}/sessions`}
				>
					<div className="min-w-0 flex-1">
						<p className="font-fira-sans text-xs font-medium text-white group-hover:text-green-800 sm:truncate sm:text-sm">
							{deployment.projectName}
						</p>
						<p className="mt-0.5 hidden font-fira-code text-xs text-gray-600 sm:block">
							{deployment.deploymentId.slice(0, 20)}...
						</p>
					</div>

					<div className="shrink-0 text-right">
						<p className="hidden font-fira-sans text-xs text-gray-500 sm:block">{t("deployed")}</p>
						<p className="font-fira-code text-xs tabular-nums text-gray-300 sm:text-sm">
							{formatDate(deployment.createdAt)}
						</p>
					</div>
				</Link>
			))}
		</div>
	);
};
