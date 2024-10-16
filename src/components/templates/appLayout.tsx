import React, { useEffect, useId, useState } from "react";

import { Outlet } from "react-router-dom";

import { defaultSystemLogSize } from "@src/constants";
import { featureFlags } from "@src/featureFlags";
import { useResize } from "@src/hooks";
import { useLoggerStore } from "@src/store";
import { TopbarType } from "@src/types/components";
import { cn } from "@utilities";

import { ProjectConfigTopbar, Sidebar, SystemLog } from "@components/organisms";

export const AppLayout = ({ className, topbarVariant }: { className?: string; topbarVariant?: TopbarType }) => {
	const appLayoutClasses = cn("h-screen w-screen pr-5 flex", className);
	const { isLoggerEnabled, toggleLogger } = useLoggerStore();
	const [isFirstLoad, setIsFirstLoad] = useState(true);
	const resizeId = useId();
	const [systemLogHeight, setSystemLogHeight] = useResize({
		direction: "vertical",
		...defaultSystemLogSize,
		id: resizeId,
	});

	useEffect(() => {
		setSystemLogHeight(isLoggerEnabled ? 20 : 0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoggerEnabled]);

	useEffect(() => {
		if (isFirstLoad) {
			setIsFirstLoad(false);

			return;
		}

		if (isLoggerEnabled !== systemLogHeight > 0) {
			toggleLogger(systemLogHeight > 0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [systemLogHeight]);

	const buttonResizeClasses = cn(
		"relative top z-20 mx-auto w-32 cursor-ns-resize rounded-14 bg-gray-1000 -mt-1 mb-0.5 p-1 transition hover:bg-gray-750",
		{ "top-0 mt-0 mb-0": systemLogHeight === 100 },
		{ "top-0 -mt-1 -mb-1.5": systemLogHeight === 0 }
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

						<div className="z-20 overflow-hidden" style={{ height: `${systemLogHeight}%` }}>
							<SystemLog />
						</div>
					</>
				) : null}
			</div>
		</div>
	);
};
