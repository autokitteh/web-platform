import React, { FunctionComponent, LazyExoticComponent, SVGProps } from "react";

import { IconSize } from "@type";

export interface IconProps {
	alt?: string;
	className?: string;
	disabled?: boolean;
	isVisible?: boolean;
	size?: IconSize;
	withCircle?: boolean;
	src: string;
}

export interface IconSvgProps extends Omit<IconProps, "src"> {
	"aria-hidden"?: boolean;
	src: React.ComponentType<SVGProps<SVGSVGElement>> | LazyExoticComponent<FunctionComponent<SVGProps<SVGSVGElement>>>;
}
