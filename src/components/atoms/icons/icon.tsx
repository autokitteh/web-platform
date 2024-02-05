import React from "react";
import { IIcon } from "@interfaces";
import { cn } from "@utilities";

export const Icon = ({ className, alt = "icon", src, disabled, isVisible = true }: Partial<IIcon>) => {
	const iconClasses = cn("transition", { "hidden opacity-0": !isVisible, "opacity-40": disabled }, className);

	return <img alt={alt} className={iconClasses} src={src} />;
};
