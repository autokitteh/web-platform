import React from "react";

import { Outlet } from "react-router-dom";

import { TopbarType } from "@src/types/components";
import { cn } from "@utilities";

import { ProjectConfigTopbar, Sidebar } from "@components/organisms";

export const AppLayout = ({ className, variantTopbar }: { className?: string; variantTopbar?: TopbarType }) => {
	const appLayoutClasses = cn("h-screen w-screen pr-5", className);

	return (
		<div className={appLayoutClasses}>
			<div className="flex h-full">
				<Sidebar />

				<div className="flex flex-1 flex-col overflow-auto transition">
					{variantTopbar ? <ProjectConfigTopbar variant={variantTopbar} /> : null}

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
