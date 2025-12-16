import { ReactNode } from "react";

import { cn } from "@utilities";

interface StatisticsHomeLayoutProps {
	projectsTable: ReactNode;
	totalCounters: ReactNode;
	deploymentStats: ReactNode;
	sessionStatusChart: ReactNode;
	className?: string;
}

export const StatisticsHomeLayout = ({
	projectsTable,
	totalCounters,
	deploymentStats,
	sessionStatusChart,
	className,
}: StatisticsHomeLayoutProps) => (
	<div className={cn("flex flex-col gap-8 overflow-y-auto p-6", className)}>
		<section aria-label="System overview">{totalCounters}</section>

		<section aria-label="Projects table" className="w-full">
			<div className="mb-4 flex items-center gap-4">
				<h2 className="font-fira-sans text-xs font-medium uppercase tracking-widest text-gray-500">Projects</h2>
				<div className="h-px flex-1 bg-gradient-to-r from-gray-1050 to-transparent" />
			</div>
			{projectsTable}
		</section>

		<div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
			<section aria-label="Deployment statistics" className="xl:col-span-7">
				<div className="rounded-xl border border-gray-1050 bg-gray-1200/50 p-5">
					<div className="mb-3 flex items-center justify-between">
						<div>
							<h3 className="font-fira-sans text-sm font-medium uppercase tracking-widest text-gray-500">
								Active Deployments
							</h3>
							<p className="mt-0.5 font-fira-sans text-xs text-gray-600">Click to view sessions</p>
						</div>
						<div className="flex items-center gap-2">
							<span className="size-2 animate-pulse rounded-full bg-green-500" />
							<span className="font-fira-code text-xs text-gray-500">Live</span>
						</div>
					</div>
					<div className="max-h-40 overflow-auto">{deploymentStats}</div>
				</div>
			</section>

			<section aria-label="Session status distribution" className="xl:col-span-5">
				<div className="flex h-full flex-col rounded-xl border border-gray-1050 bg-gray-1200/50 p-5">
					<div className="mb-2">
						<h3 className="font-fira-sans text-sm font-medium uppercase tracking-widest text-gray-500">
							Session Distribution
						</h3>
						<p className="mt-0.5 font-fira-sans text-xs text-gray-600">Current status breakdown</p>
					</div>
					<div className="flex flex-1 items-center justify-center">{sessionStatusChart}</div>
				</div>
			</section>
		</div>
	</div>
);
