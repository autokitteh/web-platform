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
}: StatisticsHomeLayoutProps) => {
	const classes = cn(
		"flex h-full flex-col justify-between gap-4 overflow-y-auto p-3 pt-1 sm:gap-8 sm:p-6 sm:pt-2",
		className
	);

	return (
		<div className={classes}>
			<section aria-label="System overview">{totalCounters}</section>

			<section
				aria-label="Projects"
				className="z-overlay flex min-h-52 flex-1 flex-col overflow-hidden sm:min-h-48"
			>
				{projectsTable}
			</section>

			<div className="grid grid-cols-1 gap-3 sm:mt-6 sm:gap-6 xl:grid-cols-12">
				<section aria-label="Deployment statistics" className="xl:col-span-7">
					<div className="flex h-full flex-col rounded-xl border border-gray-1050 bg-gray-1200/50 p-3 sm:p-5">
						<div className="mb-2 flex items-center justify-between sm:mb-3">
							<div>
								<h3 className="font-fira-sans text-xs font-medium uppercase tracking-widest text-gray-500 sm:text-sm">
									Active Deployments
								</h3>
								<p className="mt-0.5 hidden font-fira-sans text-xs text-gray-600 sm:block">
									Click to view sessions
								</p>
							</div>
							<div className="flex items-center gap-1.5 sm:gap-2">
								<span className="size-1.5 animate-pulse rounded-full bg-green-500 sm:size-2" />
								<span className="font-fira-code text-10 text-gray-500 sm:text-xs">Live</span>
							</div>
						</div>
						<div className="max-h-36 flex-1 overflow-auto sm:max-h-44">{deploymentStats}</div>
					</div>
				</section>

				<section aria-label="Session status distribution" className="xl:col-span-5">
					<div className="flex h-full flex-col rounded-xl border border-gray-1050 bg-gray-1200/50 p-3 sm:p-5">
						<div className="mb-1 sm:mb-2">
							<h3 className="font-fira-sans text-xs font-medium uppercase tracking-widest text-gray-500 sm:text-sm">
								Session Distribution
							</h3>
							<p className="mt-0.5 hidden font-fira-sans text-xs text-gray-600 sm:block">
								Current status breakdown
							</p>
						</div>
						<div className="flex flex-1 items-center justify-center">{sessionStatusChart}</div>
					</div>
				</section>
			</div>
		</div>
	);
};
