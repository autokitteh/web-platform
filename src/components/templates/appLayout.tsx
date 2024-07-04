import { Sidebar, StatsTopbar, Topbar } from "@components/organisms";
import React from "react";
import { Outlet } from "react-router-dom";

export const AppLayout = ({
	displayStatsTopbar,
	displayTopbar,
}: {
	displayStatsTopbar?: boolean;
	displayTopbar?: boolean;
}) => {
	return (
		<div className="h-screen pr-5 w-screen">
			<div className="flex h-full">
				<Sidebar />

				<div className="-ml-7 flex flex-1 flex-col overflow-auto pl-7 transition">
					{displayTopbar ? <Topbar /> : null}

					{displayStatsTopbar ? <StatsTopbar /> : null}

					<div className="h-full">
						<div className="flex gap-6 h-full">
							<Outlet />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
