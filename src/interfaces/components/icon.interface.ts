import React from "react";

export interface IconProps {
	alt?: string;
	className?: string;
	disabled?: boolean;
	isVisible?: boolean;
	size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
	src: string;
}

export interface IconSvgProps extends Omit<IconProps, "src"> {
	src: React.FC<React.SVGProps<SVGSVGElement>>;
}
