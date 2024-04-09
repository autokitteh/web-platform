import React, { useState, useRef } from "react";
import { DropdownMenu } from "@components/atoms";
import { IDropdownButton, IDropdownState } from "@interfaces/components";
import { cn } from "@utilities";

export const DropdownButton = ({ contentMenu, className, ariaLabel, children }: IDropdownButton) => {
	const parentRef = useRef<HTMLDivElement>(null);
	const [dropdownState, setDropdownState] = useState<IDropdownState>({ isOpen: false, style: {} });

	const baseStyle = cn("relative shrink-0", className);

	const handleMouseEnter = () => {
		if (!parentRef.current) return;

		const { top, left, height, width } = parentRef.current.getBoundingClientRect();
		setDropdownState({
			isOpen: true,
			style: {
				top: `${top + height}px`,
				left: `${left + width / 2}px`,
			},
		});
	};

	const handleMouseLeave = () => setDropdownState((prev) => ({ ...prev, isOpen: false }));

	return (
		<div
			aria-label={ariaLabel}
			className={baseStyle}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			ref={parentRef}
		>
			{children}
			<DropdownMenu isOpen={dropdownState.isOpen} style={dropdownState.style}>
				{contentMenu}
			</DropdownMenu>
		</div>
	);
};
