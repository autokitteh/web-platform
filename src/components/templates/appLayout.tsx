import React, { useEffect, useId, useState } from "react";

import { Outlet } from "react-router-dom";

import { defaultSystemLogSize } from "@src/constants";
import { useResize } from "@src/hooks";
import { useLoggerStore } from "@src/store";
import { cn } from "@utilities";

import { ResizeButton } from "@components/atoms";
import { ProjectConfigTopbar, Sidebar, SystemLog } from "@components/organisms";

export const AppLayout = ({ className, hideTopbar }: { className?: string; hideTopbar?: boolean }) => {
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
		"-mt-1 mb-0.5",
		{ "top-0 mt-0 mb-0": systemLogHeight === 100 },
		{ "top-0 -mt-1 -mb-1.5": systemLogHeight === 0 }
	);

	return (
		<div className={appLayoutClasses}>
			<Sidebar />

			<div className="mb-2 flex flex-1 flex-col">
				{hideTopbar ? null : <ProjectConfigTopbar />}
				<div className="flex overflow-hidden" style={{ height: `${100 - systemLogHeight}%` }}>
					<Outlet />
				</div>

				<ResizeButton className={buttonResizeClasses} direction="vertical" resizeId={resizeId} />

				<div className="z-20 overflow-hidden" style={{ height: `${systemLogHeight}%` }}>
					<SystemLog />
				</div>
			</div>
		</div>
	);
};
