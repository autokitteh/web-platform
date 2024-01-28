import React from "react";
import { cn } from "@utils";

interface IIcon {
	className?: string;
	alt?: string;
	src: string;
	isVisible?: boolean;
}

export const Icon = ({ className, alt = "icon", src, isVisible = true }: IIcon) => {
	const iconClasses = cn({ "hidden opacity-0": !isVisible }, className);

	return <img alt={alt} className={iconClasses} src={src} />;
};
