import React, { useId } from "react";

import { Outlet } from "react-router-dom";

import { useResize } from "@src/hooks";
import { TopbarType } from "@src/types/components";
import { cn } from "@utilities";

import { ProjectConfigTopbar, Sidebar, SystemLog } from "@components/organisms";

export const AppLayout = ({ className, topbarVariant }: { className?: string; topbarVariant?: TopbarType }) => {
	const appLayoutClasses = cn("h-screen w-screen pr-5 flex", className);
	const resizeId = useId();
	const [systemLogHeight] = useResize({
		direction: "vertical",
		initial: 100,
		max: 100,
		min: 15,
		id: resizeId,
	});
	const buttonResizeClasses = cn(
		"relative -top-1 z-20 m-auto w-32 cursor-ns-resize rounded-14 bg-gray-1000 p-1 transition hover:bg-gray-750",
		{ "top-0": systemLogHeight === 100 }
	);

	return (
		<div className={appLayoutClasses}>
			<Sidebar />

			<div className="mb-2 flex flex-1 flex-col">
				{topbarVariant ? <ProjectConfigTopbar variant={topbarVariant} /> : null}
				<div className="flex overflow-hidden" style={{ height: `${100 - systemLogHeight}%` }}>
					<Outlet />
				</div>

				<button className={buttonResizeClasses} data-resize-id={resizeId} />

				<div className="z-20" style={{ height: `${systemLogHeight}%` }}>
					<SystemLog />
				</div>
			</div>
		</div>
	);
};
