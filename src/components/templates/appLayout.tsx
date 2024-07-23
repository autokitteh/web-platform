import React from "react";

import { Outlet } from "react-router-dom";

import { cn } from "@utilities";

import { ProjectTopbar, Sidebar, StatsTopbar } from "@components/organisms";

export const AppLayout = ({
	className,
	displayStatsTopbar,
	displayTopbar,
}: {
	className?: string;
	displayStatsTopbar?: boolean;
	displayTopbar?: boolean;
}) => {
	const appLayoutClasses = cn("h-screen w-screen pr-5", className);

	return (
		<div className={appLayoutClasses}>
			<div className="flex h-full">
				<Sidebar />

				<div className="-ml-7 flex flex-1 flex-col overflow-auto pl-7 transition">
					{displayTopbar ? <ProjectTopbar /> : null}

					{displayStatsTopbar ? <StatsTopbar /> : null}

					<div className="h-full">
						<div className="flex h-full gap-6">
							<Outlet />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
