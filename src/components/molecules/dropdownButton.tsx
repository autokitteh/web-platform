import React, { useRef, useState } from "react";

import { DropdownButtonProps } from "@interfaces/components";
import { cn } from "@utilities";

import { DropdownMenu } from "@components/atoms";

export const DropdownButton = ({ ariaLabel, children, className, contentMenu }: DropdownButtonProps) => {
	const parentRef = useRef<HTMLDivElement>(null);
	const popoverRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [position, setPosition] = useState<React.CSSProperties>({});

	const baseStyle = cn("relative shrink-0", className);

	const handleMouseEnter = () => {
		if (!popoverRef.current || !parentRef.current) {
			return;
		}

		const { height, left, top, width } = parentRef.current.getBoundingClientRect();
		setPosition({
			left: `${left + width / 2}px`,
			top: `${top + height}px`,
		});

		if (popoverRef.current.showPopover && !popoverRef.current.matches(":popover-open")) {
			popoverRef.current.showPopover();
		}
		setIsOpen(true);
	};

	const handleMouseLeave = () => {
		setIsOpen(false);
		if (popoverRef.current?.hidePopover && popoverRef.current.matches(":popover-open")) {
			popoverRef.current.hidePopover();
		}
	};

	return (
		<div
			aria-label={ariaLabel}
			className={baseStyle}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			ref={parentRef}
		>
			{children}

			<DropdownMenu
				isOpen={isOpen}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				ref={popoverRef}
				style={position}
			>
				{contentMenu}
			</DropdownMenu>
		</div>
	);
};
