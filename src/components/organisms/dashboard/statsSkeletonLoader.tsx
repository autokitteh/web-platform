import React from "react";

import { SkeletonLoader } from "@components/organisms/configuration/shared";

export const DashboardStatsSkeletonLoader = () => {
	return (
		<div className="flex items-center gap-1">
			<SkeletonLoader className="h-7 w-48" />
		</div>
	);
};
