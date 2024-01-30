import React, { useState, useRef } from "react";

import { Button, Icon, DropdownMenu } from "@components/atoms";
import { IButton } from "@components/atoms/buttons";

interface IDropdownButton extends Partial<IButton> {
	iconLeft?: string | React.FC<React.SVGProps<SVGSVGElement>>;
	name: string;
}

export const DropdownButton = ({ iconLeft, name, children, disabled }: IDropdownButton) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const handleMouseEnter = () => setIsOpen(true);
	const handleMouseLeave = () => setIsOpen(false);

	return (
		<div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} ref={dropdownRef}>
			<div className="absolute w-full left-0 h-2 -bottom-2" />
			<Button disabled={disabled} className="px-4 py-2.5" fontWeight={600} variant="outline" color="white">
				{iconLeft ? <Icon disabled={disabled} src={iconLeft} /> : null}
				{name}
			</Button>
			<DropdownMenu isOpen={isOpen}>{children}</DropdownMenu>
		</div>
	);
};
