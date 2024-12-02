import { useEffect, useState } from "react";

const getWindowDimensions = () => {
	const { innerHeight: height, innerWidth: width } = window;

	const isDesktop = width >= 1680;
	const isDesktopSmall = width <= 1440;
	const isLaptop = width <= 1199;
	const isLaptopSmall = width <= 1024;
	const isTablet = width <= 768;
	const isMobile = width <= 640;

	return {
		width,
		height,

		isDesktop,
		isDesktopSmall,
		isLaptop,
		isLaptopSmall,
		isTablet,
		isMobile,
	};
};

export const useWindowDimensions = () => {
	const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

	useEffect(() => {
		function handleResize() {
			setWindowDimensions(getWindowDimensions());
		}

		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return windowDimensions;
};
