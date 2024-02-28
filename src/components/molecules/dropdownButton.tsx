import React, { useState, useRef } from "react";
import { DropdownMenu } from "@components/atoms";
import { IDropdownButton } from "@interfaces/components";
import { cn } from "@utilities";

export const DropdownButton = ({ contentMenu, className, children }: IDropdownButton) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const baseStyle = cn("relative shrink-0", className);

	const handleMouseEnter = () => setIsOpen(true);
	const handleMouseLeave = () => setIsOpen(false);

	return (
		<div className={baseStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} ref={containerRef}>
			{children}
			{containerRef.current ? (
				<DropdownMenu container={containerRef.current} isOpen={isOpen}>
					{contentMenu}
				</DropdownMenu>
			) : null}
		</div>
	);
};
