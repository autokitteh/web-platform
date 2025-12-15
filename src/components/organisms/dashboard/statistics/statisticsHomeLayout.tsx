import { ReactNode } from "react";

import { cn } from "@utilities";

interface StatisticsHomeLayoutProps {
	projectsTable: ReactNode;
	sessionStatusChart: ReactNode;
	errorSessionsTable: ReactNode;
	sessionsOverTimeChart: ReactNode;
	heroStats: ReactNode;
	className?: string;
}

export const StatisticsHomeLayout = ({
	projectsTable,
	sessionStatusChart,
	errorSessionsTable,
	sessionsOverTimeChart,
	heroStats,
	className,
}: StatisticsHomeLayoutProps) => (
	<div className={cn("flex flex-col gap-6 overflow-y-auto p-6", className)}>
		<section aria-label="Projects table">{projectsTable}</section>

		<section aria-label="Key metrics">{heroStats}</section>

		<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<section aria-label="Session status distribution">{sessionStatusChart}</section>
			<section aria-label="Recent error sessions">{errorSessionsTable}</section>
		</div>

		<section aria-label="Sessions over time">{sessionsOverTimeChart}</section>
	</div>
);
