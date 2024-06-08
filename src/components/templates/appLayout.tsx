import React from "react";
import { Topbar, StatsTopbar, Sidebar } from "@components/organisms";
import { Outlet } from "react-router-dom";

export const AppLayout = ({
	displayTopbar,
	displayStatsTopbar,
}: {
	displayTopbar?: boolean;
	displayStatsTopbar?: boolean;
}) => {
	return (
		<div className="w-screen h-screen pr-5">
			<div className="flex h-full">
				<Sidebar />
				<div className="flex-1 flex flex-col overflow-auto pl-7 -ml-7 transition">
					{displayTopbar ? <Topbar /> : null}
					{displayStatsTopbar ? <StatsTopbar /> : null}
					<div className="py-2.5 flex-1">
						<div className="h-full">
							<div className="flex h-full gap-6">
								<Outlet />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
