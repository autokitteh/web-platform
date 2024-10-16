import React, { useEffect, useId } from "react";

import { Outlet } from "react-router-dom";

import { featureFlags } from "@src/featureFlags";
import { useResize } from "@src/hooks";
import { useLoggerStore } from "@src/store";
import { TopbarType } from "@src/types/components";
import { cn } from "@utilities";

import { ProjectConfigTopbar, Sidebar, SystemLog } from "@components/organisms";

export const AppLayout = ({ className, topbarVariant }: { className?: string; topbarVariant?: TopbarType }) => {
	const appLayoutClasses = cn("h-screen w-screen pr-5 flex", className);
	const { isLoggerEnabled, switchLogger } = useLoggerStore();
	const resizeId = useId();
	const [systemLogHeight, setSystemLogHeight] = useResize({
		direction: "vertical",
		initial: 20,
		max: 100,
		min: 0,
		id: resizeId,
	});

	useEffect(() => {
		setSystemLogHeight(isLoggerEnabled ? 20 : 0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoggerEnabled]);

	useEffect(() => {
		if (systemLogHeight === 0) {
			switchLogger(false);

			return;
		}
		if (isLoggerEnabled === false && systemLogHeight > 0) {
			switchLogger(true);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [systemLogHeight]);

	const buttonResizeClasses = cn(
		"relative -top-1 z-20 mx-auto w-32 cursor-ns-resize rounded-14 bg-gray-1000 p-1 transition hover:bg-gray-750",
		{ "top-0": systemLogHeight === 100 || systemLogHeight === 0 }
	);

	return (
		<div className={appLayoutClasses}>
			<Sidebar />

			<div className="mb-2 flex flex-1 flex-col">
				{topbarVariant ? <ProjectConfigTopbar variant={topbarVariant} /> : null}
				<div className="flex overflow-hidden" style={{ height: `${100 - systemLogHeight}%` }}>
					<Outlet />
				</div>

				{featureFlags.systemLog ? (
					<>
						<div className={buttonResizeClasses} data-resize-id={resizeId} />

						<div className="z-20 overflow-hidden transition" style={{ height: `${systemLogHeight}%` }}>
							<SystemLog />
						</div>
					</>
				) : null}
			</div>
		</div>
	);
};
