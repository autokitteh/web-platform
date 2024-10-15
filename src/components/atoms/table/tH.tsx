import React from "react";

import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Th = ({ children, className, hasFixedWidth = false, onClick }: TableProps) => {
	const thStyle = cn(
		"flex h-9.5 items-center gap-1 truncate px-4",
		{
			"w-full": !hasFixedWidth,
		},
		className
	);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onClick && onClick(event as unknown as React.MouseEvent<HTMLDivElement>);
		}
	};

	return (
		<div
			className={thStyle}
			onClick={onClick}
			onKeyDown={handleKeyDown}
			role="columnheader"
			style={{ cursor: onClick ? "pointer" : "default" }}
			tabIndex={0}
		>
			{children}
		</div>
	);
};
