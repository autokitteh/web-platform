import { useEffect, useState } from "react";

const getWindowDimensions = () => {
	const width = window.innerWidth;
	const height = window.innerHeight;

	const isIOS =
		/iPad|iPhone|iPod/.test(navigator.userAgent) ||
		(/Mac/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
	const isMac = /Mac/i.test(navigator.userAgent) && !isIOS;

	const isMobile = width <= 640;
	const isTablet = width > 640 && width <= 1024;
	const isDesktop = width > 1024 && width <= 1920;
	const is2KDesktop = width > 1920 && width <= 2560;
	const is4KDesktop = width > 2560;

	return {
		width,
		height,
		isIOS,
		isMac,
		isMobile,
		isTablet,
		isDesktop,
		is2KDesktop,
		is4KDesktop,
	};
};

export const useWindowDimensions = () => {
	const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

	useEffect(() => {
		const handleResize = () => setWindowDimensions(getWindowDimensions());
		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return windowDimensions;
};
