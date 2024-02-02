import React from "react";
import { Link as LinkReact } from "react-router-dom";

import { cn } from "@utils";

interface ILinkProps {
	to: string;
	className?: string;
	disabled?: boolean;
	children: React.ReactNode;
}

export const Link = ({ to, className, disabled, children }: ILinkProps) => {
	const linkClass = cn(className, {
		"cursor-not-allowed pointer-events-none select-none": disabled,
	});

	return (
		<LinkReact className={linkClass} to={to}>
			{children}
		</LinkReact>
	);
};
