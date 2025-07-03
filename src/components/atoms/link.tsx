import React from "react";

import { Link as LinkReact } from "react-router-dom";

import { LinkProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Link = ({ ariaLabel, children, className, disabled, target, title, to, id }: LinkProps) => {
	const linkClass = cn(
		{
			"pointer-events-none cursor-not-allowed select-none": disabled,
		},
		className
	);

	return (
		<LinkReact aria-label={ariaLabel} className={linkClass} id={id} target={target} title={title} to={to}>
			{children}
		</LinkReact>
	);
};
