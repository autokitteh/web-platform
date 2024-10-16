import React from "react";

import { Outlet } from "react-router-dom";

import { useResize } from "@src/hooks";
import { TopbarType } from "@src/types/components";
import { cn } from "@utilities";

import { Button } from "@components/atoms";
import { ProjectConfigTopbar, Sidebar, SystemLog } from "@components/organisms";

export const AppLayout = ({ className, topbarVariant }: { className?: string; topbarVariant?: TopbarType }) => {
	const appLayoutClasses = cn("h-screen w-screen pr-5", className);
	const [outputHeight] = useResize({ direction: "vertical", initial: 30, max: 70, min: 25 });

	return (
		<div className={appLayoutClasses}>
			<div className="flex h-full">
				<Sidebar />

				<div className="flex h-full flex-1 flex-col overflow-auto">
					{topbarVariant ? <ProjectConfigTopbar variant={topbarVariant} /> : null}
					<Outlet />
					{/* eslint-disable tailwindcss/no-custom-classname */}
					<Button className="resize-handle-vertical relative -top-1 m-auto w-32 cursor-ns-resize bg-gray-1100 p-1 hover:bg-gray-750" />

					<div className="mb-2" style={{ height: `${outputHeight as number}%` }}>
						<SystemLog />
					</div>
				</div>
			</div>
		</div>
	);
};
