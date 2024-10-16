import React from "react";

import { Outlet } from "react-router-dom";

import { TopbarType } from "@src/types/components";
import { cn } from "@utilities";

import { ProjectConfigTopbar, Sidebar, SystemLog } from "@components/organisms";

export const AppLayout = ({ className, topbarVariant }: { className?: string; topbarVariant?: TopbarType }) => {
	const appLayoutClasses = cn("h-screen w-screen pr-5", className);

	return (
		<div className={appLayoutClasses}>
			<div className="flex h-full">
				<Sidebar />

				<div className="flex h-full flex-1 flex-col overflow-auto">
					{topbarVariant ? <ProjectConfigTopbar variant={topbarVariant} /> : null}

					<Outlet />
					<SystemLog />
				</div>
			</div>
		</div>
	);
};
