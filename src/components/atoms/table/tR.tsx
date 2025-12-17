import React from "react";

import { TableProps } from "@interfaces/components";
import { cn } from "@utilities";

import { useTableVariant } from "@components/atoms/table";

export const Tr = ({ children, className, onClick, style, ariaLabel, dataTestId }: TableProps) => {
	const { variant } = useTableVariant();
	const tRStyle = cn(
		"flex border-b-2 border-gray-1050 transition",
		{
			"hover:bg-gray-1250": onClick,
			"hover:bg-transparent": variant === "light" && !onClick,
		},
		className
	);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onClick && onClick(event as unknown as React.MouseEvent<HTMLDivElement>);
		}
	};

	const ariaLabelDiv = ariaLabel ? `Select ${ariaLabel} row` : "Select row";

	const interactiveProps = onClick
		? {
				onClick,
				onKeyDown: handleKeyDown,
				tabIndex: 0,
				"aria-label": ariaLabelDiv,
				style: { ...style, cursor: "pointer" },
			}
		: { style };

	return (
		<div className={tRStyle} role="row" {...interactiveProps} data-testid={dataTestId}>
			{children}
		</div>
	);
};
