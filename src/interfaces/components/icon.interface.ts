import React, { FunctionComponent, LazyExoticComponent, SVGProps } from "react";

import { IconType } from "react-icons";

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

export type SvgIconType =
	| React.ComponentType<SVGProps<SVGSVGElement>>
	| LazyExoticComponent<FunctionComponent<SVGProps<SVGSVGElement>>>
	| IconType;

export interface IconSvgProps extends Omit<IconProps, "src"> {
	"aria-hidden"?: boolean;
	src: SvgIconType;
}
