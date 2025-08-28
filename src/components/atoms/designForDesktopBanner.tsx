import React, { useState, useEffect } from "react";

import Cookies from "js-cookie";
import { AnimatePresence, motion } from "motion/react";

import { systemCookies } from "@constants";

import { IconSvg, MobileOnly, IconButton } from "@components/atoms";

import { LaptopIcon, Close } from "@assets/image/icons";

export const DesignForDesktopBanner = () => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const isDismissed = Cookies.get(systemCookies.designForDesktopBannerDismissed);
		if (!isDismissed) {
			setIsVisible(true);
		}
	}, []);

	const handleClose = () => {
		setIsVisible(false);
		Cookies.set(systemCookies.designForDesktopBannerDismissed, "true", {
			path: "/",
		});
	};

	return (
		<MobileOnly>
			<AnimatePresence>
				{isVisible ? (
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="fixed inset-x-0 top-0 z-50 flex items-center justify-center border-0 border-b-0.5 border-b-green-800 bg-gray-1250 p-2 text-green-800 shadow-md shadow-gray-1250"
						exit={{ opacity: 0, y: -100 }}
						initial={{ opacity: 0, y: -100 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
					>
						<IconSvg className="mr-2 fill-green-800" src={LaptopIcon} />
						Designed for Desktop
						<IconButton
							ariaLabel="Close banner"
							className="ml-auto rounded p-1 hover:bg-green-800/20"
							onClick={handleClose}
						>
							<IconSvg className="fill-green-800/60" size="sm" src={Close} />
						</IconButton>
					</motion.div>
				) : null}
			</AnimatePresence>
		</MobileOnly>
	);
};
