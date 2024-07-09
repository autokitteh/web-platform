import React from "react";

export interface IconProps {
	alt?: string;
	className?: string;
	disabled?: boolean;
	isVisible?: boolean;
	src: string;
}

export interface IconSvgProps extends Omit<IconProps, "src"> {
	src: React.FC<React.SVGProps<SVGSVGElement>>;
}
