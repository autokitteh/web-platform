import { ReactNode } from "react";

import { cn } from "@utilities";

interface ProjectDashboardLayoutProps {
	overview: ReactNode;
	sessionCharts: ReactNode;
	connectionChart?: ReactNode;
	className?: string;
}

export const ProjectDashboardLayout = ({
	overview,
	sessionCharts,
	connectionChart,
	className,
}: ProjectDashboardLayoutProps) => (
	<div className={cn("flex flex-col gap-6", className)}>
		<section aria-label="Project overview">{overview}</section>
		<section aria-label="Session analytics" className="grid gap-6 lg:grid-cols-2">
			{sessionCharts}
		</section>
		{connectionChart ? <section aria-label="Connections">{connectionChart}</section> : null}
	</div>
);
