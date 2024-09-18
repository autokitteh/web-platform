import React from "react";

import { Frame } from "@components/atoms";
import { DashboardTopbar, ProjectsTable } from "@components/organisms";
import { ProjectTemplatesSection } from "@components/organisms/dashboard/templates";

export const Dashboard = () => {
	return (
		<div className="m-4 ml-0 w-full overflow-hidden rounded-2xl">
			<div className="flex h-full">
				<Frame className="relative flex w-2/3 flex-col rounded-r-none bg-gray-1100">
					<DashboardTopbar />

					<ProjectsTable />
				</Frame>

				<ProjectTemplatesSection />
			</div>
		</div>
	);
};
