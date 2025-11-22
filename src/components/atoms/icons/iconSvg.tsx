import React from "react";

import { IconSvgProps } from "@interfaces/components";
import { cn } from "@utilities";

export const IconSvg = React.forwardRef<SVGSVGElement, IconSvgProps>(function IconSvg(
	{
		alt = "icon",
		"aria-hidden": ariaHidden = false,
		className,
		disabled,
		isVisible = true,
		size = "md",
		src: Svg,
		withCircle,
	},
	ref
) {
	const sizeClasses = {
		xs: "w-2 h-2",
		sm: "w-3 h-3",
		md: "w-4 h-4",
		lg: "w-5 h-5",
		xl: "w-6 h-6",
		"2xl": "w-8 h-8",
		"3xl": "w-10 h-10",
		"36": "w-36 h-36",
	};

	const iconClasses = cn(
		"transition",
		{ "hidden opacity-0": !isVisible, "opacity-40": disabled },
		{ "rounded-full border border-gray-550 p-0.5": withCircle },
		sizeClasses[size],
		className
	);

	const ariaLabel = ariaHidden ? undefined : alt;

	return Svg ? <Svg aria-hidden={ariaHidden} aria-label={ariaLabel} className={iconClasses} ref={ref} /> : null;
});

IconSvg.displayName = "IconSvg";
