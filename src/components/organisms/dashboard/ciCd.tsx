import React from "react";

import { DashboardCardTab } from "@components/organisms/dashboard";

export const CiCd = () => {
	return (
		<div className="mt-6 grid grid-cols-auto-fit-305 gap-x-4 gap-y-5 text-black">
			<DashboardCardTab />

			<DashboardCardTab />
		</div>
	);
};
