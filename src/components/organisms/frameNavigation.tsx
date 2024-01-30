import React, { useState } from "react";
import { cn } from "@utils/index";

import { Frame, Tabs, Tab, TabList, TabPanel } from "@components/atoms";
import { Icon, IconButton } from "@components/atoms";

import LogoFrame from "@assets/LogoFrame.svg?react";
import Minimize from "@assets/icons/Minimize.svg?react";

interface IFrameNavigation {
	children?: React.ReactNode;
}

export const FrameNavigation = ({ children }: IFrameNavigation) => {
	const [isFullScreen, setIsFullScreen] = useState(false);

	const mainFrameStyle = cn(
		"rounded-l-none transition-all duration-300",
		{ "rounded-2xl": !children },
		{ "max-w-full": isFullScreen, "max-w-[550px]": !isFullScreen }
	);

	const handleFullScreenToggle = () => setIsFullScreen(!isFullScreen);

	return (
		<div className="flex justify-end h-full">
			{children ? (
				<Frame className="rounded-r-none max-w-[680px] border-r border-gray-600" color="darkGray">
					<IconButton
						icon={Minimize}
						variant="filled"
						className="hover:scale-125 absolute -left-5 top-1/2 -translate-y-1/2 z-50"
						onClick={handleFullScreenToggle}
					/>
					{children}
				</Frame>
			) : null}
			<Frame className={mainFrameStyle}>
				<Tabs defaultValue="MANIFEST">
					<TabList className="uppercase">
						<Tab value="MANIFEST">MANIFEST</Tab>
						<Tab value="CODE">CODE</Tab>
					</TabList>
					<TabPanel value="MANIFEST">"MANIFEST"</TabPanel>
				</Tabs>
				<Icon src={LogoFrame} className="absolute bottom-7 right-7" />
			</Frame>
		</div>
	);
};
