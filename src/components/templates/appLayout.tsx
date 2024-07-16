import React from "react";

import { Outlet } from "react-router-dom";

import { cn } from "@utilities";

import { Sidebar, StatsTopbar, Topbar } from "@components/organisms";

export const AppLayout = ({
	classnName,
	displayStatsTopbar,
	displayTopbar,
}: {
	classnName?: string;
	displayStatsTopbar?: boolean;
	displayTopbar?: boolean;
}) => {
	const appLayoutClasses = cn("h-screen w-screen pr-5", classnName);

	return (
		<div className={appLayoutClasses}>
			<div className="flex h-full">
				<Sidebar />

				<div className="-ml-7 flex flex-1 flex-col overflow-auto pl-7 transition">
					{displayTopbar ? <Topbar /> : null}

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
