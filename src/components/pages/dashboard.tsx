import React from "react";

import { DashboardTopbar, ProjectsTable, TemplateProjects } from "@components/organisms";

export const Dashboard: React.FC = () => {
	return (
		<div className="w-full">
			<div className="flex h-full gap-7">
				<div className="relative flex w-2/3 flex-col">
					<DashboardTopbar />

					<ProjectsTable />
				</div>

				<TemplateProjects />
			</div>
		</div>
	);
};
