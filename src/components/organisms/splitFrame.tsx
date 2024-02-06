import React, { useState, PropsWithChildren } from "react";
import { Minimize, LogoFrame } from "@assets/image";
import { Frame, Tabs, Tab, TabList, TabPanel } from "@components/atoms";
import { IconButton } from "@components/atoms";
import { cn } from "@utilities";

export const SplitFrame = ({ children }: PropsWithChildren) => {
	const [isFullScreen, setIsFullScreen] = useState(false);

	const mainFrameStyle = cn(
		"rounded-l-none transition-all duration-300",
		{ "rounded-2xl": !children },
		{ "max-w-full": isFullScreen, "max-w-650": !isFullScreen }
	);

	const handleFullScreenToggle = () => setIsFullScreen(!isFullScreen);

	return (
		<div className="flex justify-end h-full">
			{children ? (
				<Frame className="rounded-r-none max-w-[680px] border-r border-gray-600 bg-gray-800">
					<IconButton
						className="hover:scale-125 absolute -left-5 top-1/2 -translate-y-1/2 z-50 bg-black"
						onClick={handleFullScreenToggle}
					>
						<Minimize />
					</IconButton>
					{children}
				</Frame>
			) : null}
			<Frame className={mainFrameStyle}>
				<Tabs defaultValue="MANIFEST">
					<TabList className="uppercase">
						<Tab value="MANIFEST">MANIFEST</Tab>
						<Tab value="CODE">CODE</Tab>
					</TabList>
					<TabPanel value="MANIFEST">MANIFEST</TabPanel>
				</Tabs>
				<LogoFrame className="absolute bottom-7 right-7" />
			</Frame>
		</div>
	);
};
