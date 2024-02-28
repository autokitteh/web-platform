import React, { useState, PropsWithChildren } from "react";
import { MapMenu } from "@components/molecules";
import { SplitFrame } from "@components/organisms";

export const MapMenuFrameLayout = ({ children }: PropsWithChildren) => {
	const [isFullScreen, setIsFullScreen] = useState(false);

	return (
		<div className="flex justify-between items-center h-full">
			<div className="max-w-485 m-auto" hidden={isFullScreen}>
				<MapMenu />
			</div>
			<SplitFrame isFullScreen={isFullScreen} setIsFullScreen={setIsFullScreen}>
				{children}
			</SplitFrame>
		</div>
	);
};
