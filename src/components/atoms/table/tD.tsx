import React, { KeyboardEvent } from "react";

import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

/* eslint-disable jsx-a11y/no-static-element-interactions */

export const Td = ({ children, className, hasFixedWidth = false, onClick }: TableProps) => {
	const tdStyle = cn(
		"flex h-9.5 w-full items-center overflow-hidden px-4",
		{
			"w-full": !hasFixedWidth,
		},
		className
	);

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onClick?.();
		}
	};

	return (
		<td className={tdStyle}>
			<div className="w-full truncate" onClick={onClick} onKeyDown={handleKeyDown}>
				{children}
			</div>
		</td>
	);
};
