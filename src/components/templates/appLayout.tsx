import React from "react";

import { Outlet } from "react-router-dom";

import { Sidebar, StatsTopbar, Topbar } from "@components/organisms";

export const AppLayout = ({ displayStatsTopbar, displayTopbar }: { displayTopbar?: boolean; displayStatsTopbar?: boolean }) => {
	return (
		<div className="h-screen w-screen pr-5">
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
