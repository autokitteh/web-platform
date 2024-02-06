import React from "react";
import { ILink } from "@interfaces/components";
import { cn } from "@utilities";
import { Link as LinkReact } from "react-router-dom";

export const Link = ({ to, className, disabled, children }: ILink) => {
	const linkClass = cn(className, {
		"cursor-not-allowed pointer-events-none select-none": disabled,
	});

	return (
		<LinkReact className={linkClass} to={to}>
			{children}
		</LinkReact>
	);
};
