import { ReactNode } from "react";

import { cn } from "@utilities";

interface HomeDashboardLayoutProps {
	heroStats: ReactNode;
	mainCharts: ReactNode;
	eventsByTrigger: ReactNode;
	topIntegrations: ReactNode;
	recentActivity: ReactNode;
	className?: string;
}

export const HomeDashboardLayout = ({
	heroStats,
	mainCharts,
	eventsByTrigger,
	topIntegrations,
	recentActivity,
	className,
}: HomeDashboardLayoutProps) => (
	<div className={cn("grid grid-cols-2 gap-6", className)}>
		<section aria-label="Overview">{recentActivity}</section>
		<section className="flex h-full flex-col justify-between">
			{mainCharts}
			<div className="flex-1" />
			{heroStats}
		</section>
		<section aria-label="Main charts" className="flex flex-col gap-6 p-6">
			<div className="flex flex-col gap-6"> {eventsByTrigger}</div>
		</section>
		<section aria-label="Secondary charts" className="flex flex-col gap-6 p-6">
			{topIntegrations}
		</section>
	</div>
);
