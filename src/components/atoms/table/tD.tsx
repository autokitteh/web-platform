import React, { KeyboardEvent } from "react";

import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

/* eslint-disable jsx-a11y/no-static-element-interactions */

export const Td = ({ children, className, onClick, title, innerDivClassName }: TableProps) => {
	const tdStyle = cn("flex h-9.5 w-full items-center overflow-hidden", className);

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onClick?.(event);
		}
	};

	const innerDivStyle = cn("w-full flex truncate pr-2", innerDivClassName);

	const cellTitle = title ? title : typeof children === "string" ? children : "";

	return (
		<div aria-label={cellTitle} className={tdStyle} role="cell" title={cellTitle}>
			<div className="flex w-full items-center" onClick={onClick} onKeyDown={handleKeyDown}>
				<div className={innerDivStyle}>{children}</div>
			</div>
		</div>
	);
};
