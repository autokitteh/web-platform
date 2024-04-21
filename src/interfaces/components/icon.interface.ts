import React from "react";

export interface IconProps {
	className?: string;
	alt?: string;
	src: string;
	isVisible?: boolean;
	disabled?: boolean;
}

export interface IconSvgProps extends Omit<IconProps, "src"> {
	src: React.FC<React.SVGProps<SVGSVGElement>>;
}
