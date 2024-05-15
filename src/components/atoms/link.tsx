import React from "react";
import { LinkProps } from "@interfaces/components";
import { cn } from "@utilities";
import { Link as LinkReact } from "react-router-dom";

export const Link = ({ to, className, disabled, ariaLabel, children }: LinkProps) => {
	const linkClass = cn(className, {
		"cursor-not-allowed pointer-events-none select-none": disabled,
	});

	return (
		<LinkReact aria-label={ariaLabel} className={linkClass} to={to}>
			{children}
		</LinkReact>
	);
};
