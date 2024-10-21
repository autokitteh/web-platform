import React from "react";

import { HrefProps } from "@interfaces/components";

export const AHref = ({ ariaLabel, children, className, href, relationship, target, title }: HrefProps) => {
	return (
		<a aria-label={ariaLabel} className={className} href={href} rel={relationship} target={target} title={title}>
			{children}
		</a>
	);
};
