import { ReactNode } from "react";

import { cn } from "@utilities";

interface HomeDashboardLayoutProps {
	heroStats: ReactNode;
	mainCharts: ReactNode;
	secondaryCharts: ReactNode;
	recentActivity: ReactNode;
	className?: string;
}

export const HomeDashboardLayout = ({
	heroStats,
	mainCharts,
	secondaryCharts,
	recentActivity,
	className,
}: HomeDashboardLayoutProps) => (
	<div className={cn("flex flex-col gap-6", className)}>
		<section aria-label="Key metrics">{heroStats}</section>
		<section aria-label="Main charts" className="grid gap-6 lg:grid-cols-2">
			{mainCharts}
		</section>
		<section aria-label="Secondary charts" className="grid gap-6 lg:grid-cols-2">
			{secondaryCharts}
		</section>
		<section aria-label="Recent activity">{recentActivity}</section>
	</div>
);
