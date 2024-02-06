import React from "react";

export interface IIcon {
	className?: string;
	alt?: string;
	src: string;
	isVisible?: boolean;
	disabled?: boolean;
}

export interface IIconSvg extends Omit<IIcon, "src"> {
	src: React.FC<React.SVGProps<SVGSVGElement>>;
}
