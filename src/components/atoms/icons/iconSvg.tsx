import React from "react";

import { IconSvgProps } from "@interfaces/components";
import { cn } from "@utilities";

export const IconSvg = ({
	alt = "icon",
	className,
	disabled,
	isVisible = true,
	size = "md",
	src: Svg,
}: IconSvgProps) => {
	const sizeClasses = {
		"xs": "w-2 h-2",
		"sm": "w-3 h-3",
		"md": "w-4 h-4",
		"lg": "w-5 h-5",
		"xl": "w-6 h-6",
		"2xl": "w-8 h-8",
	};

	const iconClasses = cn(
		"transition",
		{ "hidden opacity-0": !isVisible, "opacity-40": disabled },
		sizeClasses[size],
		className
	);

	return <Svg aria-label={alt} className={iconClasses} />;
};
