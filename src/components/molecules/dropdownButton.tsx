import React, { useRef, useState } from "react";

import { DropdownButtonProps, DropdownState } from "@interfaces/components";
import { cn } from "@utilities";

import { DropdownMenu } from "@components/atoms";

export const DropdownButton = ({ ariaLabel, children, className, contentMenu }: DropdownButtonProps) => {
	const parentRef = useRef<HTMLDivElement>(null);
	const [dropdownState, setDropdownState] = useState<DropdownState>({ isOpen: false, style: {} });

	const baseStyle = cn("relative shrink-0", className);

	const handleMouseEnter = () => {
		if (!parentRef.current) {
			return;
		}

		const { height, left, top, width } = parentRef.current.getBoundingClientRect();
		setDropdownState({
			isOpen: true,
			style: {
				left: `${left + width / 2}px`,
				top: `${top + height}px`,
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
