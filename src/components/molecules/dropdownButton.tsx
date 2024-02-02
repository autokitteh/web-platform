import React, { useState } from "react";
import { Button, Icon, DropdownMenu } from "@components/atoms";
import { IButton } from "@components/atoms/buttons";
import { cn } from "@utils";

enum EDropdownButtonPlacement {
	default = "default",
	left = "left",
	right = "right",
}

type TDropdownButtonVariant = keyof typeof EDropdownButtonPlacement;

interface IDropdownButton extends Partial<IButton> {
	placement?: TDropdownButtonVariant;
	iconLeft?: string | React.FC<React.SVGProps<SVGSVGElement>>;
	name?: string;
}

export const DropdownButton = ({ iconLeft, name, children, placement, disabled, className }: IDropdownButton) => {
	const [isOpen, setIsOpen] = useState(false);
	const baseStyle = cn("relative shrink-0", className);

	const handleMouseEnter = () => setIsOpen(true);
	const handleMouseLeave = () => setIsOpen(false);

	return (
		<div className={baseStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
			<div className="absolute w-full left-0 h-2 -bottom-2" />
			<Button className="px-4 py-2.5 font-semibold" color="white" disabled={disabled} variant="outline">
				{iconLeft ? <Icon disabled={disabled} src={iconLeft} /> : null}
				{name}
			</Button>
			<DropdownMenu isOpen={isOpen} placement={placement}>
				{children}
			</DropdownMenu>
		</div>
	);
};
