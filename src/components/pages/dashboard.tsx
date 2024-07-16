import React from "react";

import { isAuthEnabled } from "@constants";

import { useUserStore } from "@store";

import { DashboardTopbar } from "@components/organisms";

export const Dashboard: React.FC = () => {
	const { logoutFunction } = useUserStore();

	return (
		<div className="w-full">
			<DashboardTopbar />

			{isAuthEnabled ? (
				<button className="text-black" onClick={() => logoutFunction()}>
					Logout
				</button>
			) : null}
		</div>
	);
};
