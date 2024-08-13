import React from "react";

import { Outlet } from "react-router-dom";

import { cn } from "@utilities";

import { DeploymentsAndSessionsTopbar, ProjectConfigTopbar, Sidebar } from "@components/organisms";

export const AppLayout = ({
	className,
	displayConfigurationTopbar,
	displayDeploymentsAndSessionsTopbar,
}: {
	className?: string;
	displayConfigurationTopbar?: boolean;
	displayDeploymentsAndSessionsTopbar?: boolean;
}) => {
	const appLayoutClasses = cn("h-screen w-screen pr-5", className);

	return (
		<div className={appLayoutClasses}>
			<div className="flex h-full">
				<Sidebar />

				<div className="flex flex-1 flex-col overflow-auto transition">
					{displayConfigurationTopbar ? <ProjectConfigTopbar /> : null}

					{displayDeploymentsAndSessionsTopbar ? <DeploymentsAndSessionsTopbar /> : null}

					<div className="mb-4 h-full">
						<div className="flex h-full gap-6">
							<Outlet />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
