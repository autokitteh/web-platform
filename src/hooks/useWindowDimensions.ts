import { useEffect, useState } from "react";

const appDimensions = {
	mobile: 640, // Standard mobile breakpoint (landscape phones)
	tablet: 1024, // Standard tablet breakpoint (iPad portrait)
	desktop: 1920, // Full HD (1080p) displays
	desktop2K: 2560, // 2K/QHD displays
	desktop4K: 3840, // 4K/UHD displays
	apple: {
		mobile: 430, // iPhone 14/15 Pro Max (largest iPhone)
		tablet: 1024, // iPad Pro 12.9" portrait
		desktop: 1728, // MacBook Pro 16"
		desktop2K: 2560, // iMac 27" 5K / Studio Display
		desktop4K: 3008, // Pro Display XDR
	},
};

const getWindowDimensions = () => {
	const width = window.innerWidth;
	const height = window.innerHeight;

	const isIOS =
		/iPad|iPhone|iPod/.test(navigator.userAgent) ||
		(/Mac/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
	const isMac = /Mac/i.test(navigator.userAgent) && !isIOS;

	const isMobile = width <= appDimensions.mobile || isIOS;
	const isTablet = width > appDimensions.mobile && width <= appDimensions.tablet;
	const isDesktop = width > appDimensions.tablet && width <= appDimensions.desktop;
	const is2KDesktop = width > appDimensions.desktop && width <= appDimensions.desktop2K;
	const is4KDesktop = width > appDimensions.desktop2K;

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

type ScreenSize = "mobile" | "tablet" | "desktop" | "desktop2K" | "desktop4K";

const sizes = {
	loader: {
		mobile: "md",
		tablet: "md",
		desktop: "md",
		desktop2K: "lg",
		desktop4K: "3xl",
	},
	global: {
		mobile: "sm",
		tablet: "md",
		desktop: "lg",
		desktop2K: "xl",
		desktop4K: "2xl",
	},
} as const;

const getCurrentScreenSize = (width: number, isApple: boolean): ScreenSize => {
	const dims = isApple ? appDimensions.apple : appDimensions;

	if (width <= dims.mobile) return "mobile";
	if (width <= dims.tablet) return "tablet";
	if (width <= dims.desktop) return "desktop";
	if (width <= dims.desktop2K) return "desktop2K";

	return "desktop4K";
};

export const useWindowDimensions = () => {
	const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

	useEffect(() => {
		const handleResize = () => setWindowDimensions(getWindowDimensions());
		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const getRelativeSize = (target?: keyof typeof sizes): "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" => {
		const sizeSet = target ? sizes[target] : sizes.global;
		const isApple = windowDimensions.isIOS || windowDimensions.isMac;
		const currentScreenSize = getCurrentScreenSize(windowDimensions.width, isApple);

		return sizeSet[currentScreenSize];
	};

	const getCurrentSize = (): ScreenSize => {
		const isApple = windowDimensions.isIOS || windowDimensions.isMac;

		return getCurrentScreenSize(windowDimensions.width, isApple);
	};

	return { ...windowDimensions, getRelativeSize, getCurrentSize };
};
