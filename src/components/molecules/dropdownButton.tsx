import React, { useState } from "react";
import { Button, Icon, DropdownMenu } from "@components/atoms";
import { IButton } from "@components/atoms/buttons";
import { cn } from "@utils";

interface IDropdownButton extends Partial<IButton> {
	iconLeft?: string | React.FC<React.SVGProps<SVGSVGElement>>;
	name?: string;
}

export const DropdownButton = ({ iconLeft, name, children, disabled, className, color, variant }: IDropdownButton) => {
	const [isOpen, setIsOpen] = useState(false);
	const baseStyle = cn("relative shrink-0", className);

	const handleMouseEnter = () => setIsOpen(true);
	const handleMouseLeave = () => setIsOpen(false);

	return (
		<div className={baseStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
			<Button className="h-full" color={color} disabled={disabled} variant={variant}>
				{iconLeft ? <Icon disabled={disabled} src={iconLeft} /> : null}
				{name}
			</Button>
			<DropdownMenu isOpen={isOpen}>{children}</DropdownMenu>
		</div>
	);
};
