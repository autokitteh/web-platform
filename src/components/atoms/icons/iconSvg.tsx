import React from "react";

import { IconSvgProps } from "@interfaces/components";
import { cn } from "@utilities";

export const IconSvg = ({ alt = "icon", className, disabled, isVisible = true, src: Svg }: IconSvgProps) => {
	const iconClasses = cn("transition", { "hidden opacity-0": !isVisible, "opacity-40": disabled }, className);

	return <Svg aria-label={alt} className={iconClasses} />;
};
