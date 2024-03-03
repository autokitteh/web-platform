import React, { PropsWithChildren } from "react";
import { MapMenu } from "@components/molecules";
import { SplitFrame } from "@components/organisms";
import { useUIGlobalStore } from "@store";

export const MapMenuFrameLayout = ({ children }: PropsWithChildren) => {
	const { isFullScreen } = useUIGlobalStore();

	return (
		<div className="flex justify-between items-center h-full">
			<div className="max-w-485 m-auto" hidden={isFullScreen}>
				<MapMenu />
			</div>
			<SplitFrame>{children}</SplitFrame>
		</div>
	);
};
