import React from "react";
import { Topbar, StatsTopbar, Sidebar } from "@components/organisms";

export const AppLayout = ({
	children,
	displayTopbar,
	displayStatsTopbar,
}: {
	children: React.ReactNode;
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
					<div className="py-2.5 flex-1">{children}</div>
				</div>
			</div>
		</div>
	);
};
