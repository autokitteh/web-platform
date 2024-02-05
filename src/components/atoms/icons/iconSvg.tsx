import React from "react";
import { IIconSvg } from "@interfaces";
import { cn } from "@utilities";

export const IconSvg = ({ className, alt = "icon", src: Svg, isVisible = true, disabled }: IIconSvg) => {
	const iconClasses = cn("transition", { "hidden opacity-0": !isVisible, "opacity-40": disabled }, className);

	return <Svg aria-label={alt} className={iconClasses} />;
};
