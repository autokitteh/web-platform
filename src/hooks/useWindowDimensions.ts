import { useEffect, useState } from "react";

const getWindowDimensions = () => {
	const width = window.screen.width;
	const height = window.screen.height;

	const isLargeDesktop = width >= 1680;
	const isMaxWidth1440 = width <= 1440;
	const isMaxWidth1199 = width <= 1199;
	const isMaxWidth1024 = width <= 1024;
	const isMaxWidth768 = width <= 768;
	const isMaxWidth640 = width <= 640;

	return {
		width,
		height,

		isLargeDesktop, // Desktops with 1680px width and above
		isMaxWidth1440, // Laptops with 1440px width and below
		isMaxWidth1199, // Tablets with 1199px width and below
		isMaxWidth1024, // Tablets with 1024px width and below
		isMaxWidth768, // Mobiles with 768px width and below
		isMaxWidth640, // Mobiles with 640px width and below
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
