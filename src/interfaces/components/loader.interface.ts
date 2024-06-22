import { SystemSizes } from "@type";

export interface LoaderProps {
	size?: SystemSizes;
	firstColor?: LoaderColorType;
	secondColor?: LoaderColorType;
	isAbsolute?: boolean;
}

type LoaderColorType = "dark-gray" | "gray";
