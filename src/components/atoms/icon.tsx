import React from "react";
import { cn } from "@utils";

interface ISVG {
	className: string;
	alt: string;
}

interface IIcon extends Partial<ISVG> {
	src: string | React.ReactNode | React.FC<React.SVGProps<SVGSVGElement>>;
	isVisible: boolean;
	disabled: boolean;
}

export const Icon = ({ className, alt = "icon", src, disabled, isVisible = true }: Partial<IIcon>) => {
	const iconClasses = cn("transition", { "hidden opacity-0": !isVisible, "opacity-40": disabled }, className);

	if (typeof src === "string") {
		return <img alt={alt} className={iconClasses} src={src} />;
	}

	if (typeof src === "function") {
		const SvgComponent = src as React.FC<React.SVGProps<SVGSVGElement>>;
		return <SvgComponent aria-label={alt} className={iconClasses} />;
	}

	return src;
};
