import { SystemSizes } from "@type";

export interface LoaderProps {
	className?: string;
	firstColor?: LoaderColorType;
	isCenter?: boolean;
	secondColor?: LoaderColorType;
	size?: SystemSizes;
}

type LoaderColorType = "dark-gray" | "gray" | "light-gray";
