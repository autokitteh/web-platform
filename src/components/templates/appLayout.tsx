import React, { useEffect, useId, useState } from "react";

import { Outlet } from "react-router-dom";

import { defaultSystemLogSize } from "@src/constants";
import { useResize, useWindowDimensions } from "@src/hooks";
import { useLoggerStore, useProjectStore } from "@src/store";
import { cn } from "@utilities";

import { ResizeButton } from "@components/atoms";
import { ProjectConfigTopbar, Sidebar, SystemLog } from "@components/organisms";

export const AppLayout = ({ className, hideTopbar }: { className?: string; hideTopbar?: boolean }) => {
	const appLayoutClasses = cn("h-screen w-screen md:pr-5 flex", className);
	const { isLoggerEnabled, toggleLogger } = useLoggerStore();
	const [isFirstLoad, setIsFirstLoad] = useState(true);
	const { isIOS, isMobile } = useWindowDimensions();

	const { projectsList } = useProjectStore();

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
		"-mt-1 mb-0.5",
		{ "top-0 mt-0 mb-0": systemLogHeight === 100 },
		{ "top-0 -mt-1 -mb-1.5": systemLogHeight === 0 }
	);

	const hideSidebar = !projectsList.length && (isMobile || isIOS) && location.pathname === "/";

	return (
		<div className={appLayoutClasses}>
			{hideSidebar ? null : <Sidebar />}

			<div className="flex flex-1 flex-col md:mb-2">
				{hideTopbar ? null : <ProjectConfigTopbar />}
				<div className="flex overflow-hidden" style={{ height: `${100 - systemLogHeight}%` }}>
					<Outlet />
				</div>
				{isIOS || isMobile ? null : (
					<ResizeButton className={buttonResizeClasses} direction="vertical" resizeId={resizeId} />
				)}
				<div className="z-20 overflow-hidden" style={{ height: `${systemLogHeight}%` }}>
					<SystemLog />
				</div>
			</div>
		</div>
	);
};
