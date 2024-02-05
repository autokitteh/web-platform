import React, { useState } from "react";
import { Minimize, LogoFrame } from "@assets/image";
import { Frame, Tabs, Tab, TabList, TabPanel } from "@components/atoms";
import { Icon, IconButton } from "@components/atoms";
import { cn } from "@utils";

interface ISplitFrame {
	children?: React.ReactNode;
}

export const SplitFrame = ({ children }: ISplitFrame) => {
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
				<Frame className="rounded-r-none max-w-[680px] border-r border-gray-600" color="darkGray">
					<IconButton
						className="hover:scale-125 absolute -left-5 top-1/2 -translate-y-1/2 z-50"
						onClick={handleFullScreenToggle}
						variant="filled"
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
				<Icon className="absolute bottom-7 right-7" src={LogoFrame} />
			</Frame>
		</div>
	);
};
