import React from "react";

import { IconSvgProps } from "@interfaces/components";
import { iconSizeClasses } from "@type/components/icon.types";
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
	const iconClasses = cn(
		"transition",
		{ "hidden opacity-0": !isVisible, "opacity-40": disabled },
		{ "rounded-full border border-gray-550 p-0.5": withCircle },
		iconSizeClasses[size],
		className
	);

	const ariaLabel = ariaHidden ? undefined : alt;

	return Svg ? <Svg aria-hidden={ariaHidden} aria-label={ariaLabel} className={iconClasses} ref={ref} /> : null;
});

IconSvg.displayName = "IconSvg";
