import React from "react";

import { Link as LinkReact } from "react-router-dom";

import { LinkProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
	(
		{
			ariaLabel,
			children,
			className,
			disabled,
			target,
			title,
			to,
			id,
			onClick,
			onKeyDown,
			onMouseEnter,
			onMouseLeave,
			role,
			tabIndex,
		},
		ref
	) => {
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
				onClick={onClick}
				onKeyDown={onKeyDown}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				ref={ref}
				role={role}
				tabIndex={tabIndex}
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
