import React from "react";

import { Link as LinkReact } from "react-router-dom";

import { LinkProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
	({ ariaLabel, children, className, disabled, target, title, to, id }, ref) => {
		const linkClass = cn(
			{
				"pointer-events-none cursor-not-allowed select-none": disabled,
			},
			className
		);

		return (
			<LinkReact
				aria-label={ariaLabel}
				className={linkClass}
				id={id}
				ref={ref}
				target={target}
				title={title}
				to={to}
			>
				{children}
			</LinkReact>
		);
	}
);

Link.displayName = "Link";
