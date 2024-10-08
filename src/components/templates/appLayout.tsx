import React from "react";

import { Outlet } from "react-router-dom";

import { cn } from "@utilities";

import { ProjectConfigTopbar, ProjectConfigWithManualTopbar, Sidebar } from "@components/organisms";

export const AppLayout = ({
	className,
	displayMainTopbar,
	displayManualRunTopbar,
}: {
	className?: string;
	displayMainTopbar?: boolean;
	displayManualRunTopbar?: boolean;
}) => {
	const appLayoutClasses = cn("h-screen w-screen pr-5", className);

	return (
		<div className={appLayoutClasses}>
			<div className="flex h-full">
				<Sidebar />

				<div className="flex flex-1 flex-col overflow-auto transition">
					{displayMainTopbar ? <ProjectConfigTopbar /> : null}
					{displayManualRunTopbar ? <ProjectConfigWithManualTopbar /> : null}

					<div className="h-full">
						<div className="flex h-full gap-6">
							<Outlet />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
