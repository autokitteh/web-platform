/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { KeyboardEvent } from "react";

import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Td = ({ children, className, onClick }: TableProps) => {
	const tdStyle = cn("w-full overflow-hidden flex items-center px-4 h-9.5", className);

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onClick?.();
		}
	};

	return (
		<td className={tdStyle}>
			<div className="truncate" onClick={onClick} onKeyDown={handleKeyDown}>
				{children}
			</div>
		</td>
	);
};
