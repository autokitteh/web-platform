import React from "react";

import { CommunityProjects, DashboardTopbar, ProjectsTable } from "@components/organisms";

export const Dashboard: React.FC = () => {
	return (
		<div className="w-full">
			<div className="flex h-full gap-7">
				<div className="w-2/3">
					<DashboardTopbar />

					<ProjectsTable />
				</div>

				<CommunityProjects />
			</div>
		</div>
	);
};
