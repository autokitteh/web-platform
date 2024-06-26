import { SystemSizes } from "@type";

export interface LoaderProps {
	size?: SystemSizes;
	firstColor?: LoaderColorType;
	secondColor?: LoaderColorType;
	isCenter?: boolean;
}

type LoaderColorType = "dark-gray" | "gray";
