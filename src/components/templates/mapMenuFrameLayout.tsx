import React, { PropsWithChildren } from "react";
import { MapMenu } from "@components/molecules";
import { SplitFrame } from "@components/organisms";
import { cn } from "@utilities";

export const MapMenuFrameLayout = ({ children }: PropsWithChildren) => {
	const baseStyle = cn("flex justify-between items-center h-full gap-6", {
		"justify-end": !children,
	});

	return (
		<div className={baseStyle}>
			<div className="max-w-485 m-auto" hidden={true}>
				<MapMenu />
			</div>
			<SplitFrame>{children}</SplitFrame>
		</div>
	);
};
