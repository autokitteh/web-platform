import React from "react";

import { DashboardTopbar, ProjectsTable } from "@components/organisms";
import { ProjectTemplatesSection } from "@components/organisms/dashboard/templates";

export const Dashboard = () => {
	return (
		<div className="w-full">
			<div className="flex h-full gap-7">
				<div className="relative flex w-2/3 flex-col">
					<DashboardTopbar />

					<ProjectsTable />
				</div>

				<ProjectTemplatesSection />
			</div>
		</div>
	);
};
