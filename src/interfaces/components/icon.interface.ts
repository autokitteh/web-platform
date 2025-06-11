import React, { FunctionComponent, LazyExoticComponent, SVGProps } from "react";

export interface IconProps {
	alt?: string;
	className?: string;
	disabled?: boolean;
	isVisible?: boolean;
	size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "36";
	withCircle?: boolean;
	src: string;
}

export interface IconSvgProps extends Omit<IconProps, "src"> {
	src: React.ComponentType<SVGProps<SVGSVGElement>> | LazyExoticComponent<FunctionComponent<SVGProps<SVGSVGElement>>>;
}
