import { LoaderColorType } from "@src/types/components/loader.type";
import { SystemSizes } from "@type";

export interface LoaderProps {
	firstColor?: LoaderColorType;
	isCenter?: boolean;
	secondColor?: LoaderColorType;
	size?: SystemSizes;
	className?: string;
}
