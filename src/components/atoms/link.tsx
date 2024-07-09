import React from "react";

import { Link as LinkReact } from "react-router-dom";

import { LinkProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Link = ({ ariaLabel, children, className, disabled, target, to }: LinkProps) => {
	const linkClass = cn(className, {
		"pointer-events-none cursor-not-allowed select-none": disabled,
	});

	return (
		<LinkReact aria-label={ariaLabel} className={linkClass} target={target} to={to}>
			{children}
		</LinkReact>
	);
};
