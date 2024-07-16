import React from "react";

import { isAuthEnabled } from "@constants";

import { useUserStore } from "@store";

import { CommunityProjects, DashboardTableProjects, DashboardTopbar } from "@components/organisms";

export const Dashboard: React.FC = () => {
	const { logoutFunction } = useUserStore();

	return (
		<div className="w-full">
			<div className="flex h-full gap-7">
				<div className="w-2/3">
					<DashboardTopbar />

					<DashboardTableProjects />
				</div>

				<CommunityProjects />
			</div>

			{isAuthEnabled ? (
				<button className="text-black" onClick={() => logoutFunction()}>
					Logout
				</button>
			) : null}
		</div>
	);
};
