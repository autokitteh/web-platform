import React from "react";
import { Minimize, LogoFrame } from "@assets/image";
import { Frame, IconButton } from "@components/atoms";
import { EditorTabs, OutputTabs } from "@components/organisms";
import { ISplitFrame } from "@interfaces/components";
import { useUIGlobalStore } from "@store";
import { cn } from "@utilities";

export const SplitFrame = ({ children }: ISplitFrame) => {
	const { isFullScreen, toggleFullScreen } = useUIGlobalStore();
	const baseStyle = cn("flex justify-end h-full w-2/3", { "w-full": isFullScreen });
	const mainFrameStyle = cn("rounded-l-none pb-0 min-w-1/2", { "rounded-2xl": !children });

	return (
		<div className={baseStyle}>
			{children ? (
				<Frame className="rounded-r-none w-1/2 border-r border-gray-600 bg-gray-800">
					<IconButton
						className="hover:scale-125 absolute -left-5 top-1/2 -translate-y-1/2 z-50 bg-black"
						onClick={toggleFullScreen}
					>
						<Minimize />
					</IconButton>
					{children}
				</Frame>
			) : null}
			<Frame className={mainFrameStyle}>
				<EditorTabs />
				<div className="-mx-8 px-8 pt-7 border-0 border-t border-t-gray-600">
					<OutputTabs />
				</div>
				<LogoFrame className="absolute bottom-7 right-7 fill-white opacity-10 pointer-events-none" />
			</Frame>
		</div>
	);
};
