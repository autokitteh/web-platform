export interface LoaderProps {
	size?: "sm" | "md" | "lg" | "xl";
	firstColor?: LoaderColorType;
	secondColor?: LoaderColorType;
}

type LoaderColorType = "dark-gray" | "gray";
