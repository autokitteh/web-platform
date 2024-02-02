import React from "react";
import { Link, Icon } from "@components/atoms";
import { IButton, EButtonVariant } from "@components/atoms/buttons";
import { cn } from "@utils";

interface IIconButtonProps extends Partial<IButton> {
	icon: string | React.FC<React.SVGProps<SVGSVGElement>>;
}

export const IconButton = ({ icon, className, variant, href, disabled, onClick }: IIconButtonProps) => {
	const iconButtonClass = cn(
		"p-2 rounded-full transition duration-300 hover:bg-gray-800",
		{
			"hover:bg-transparent": variant === EButtonVariant.transparent,
			"bg-black": variant === EButtonVariant.filled,
			"border border-gray-400 hover:border-transparent": variant === EButtonVariant.outline,
			"p-0 hover:bg-transparent": variant === EButtonVariant.subtle,
		},
		{
			"opacity-40 cursor-not-allowed": disabled,
			"hover:bg-transparent hover:border-gray-400": disabled && variant === EButtonVariant.outline,
		},
		className
	);

	return !href ? (
		<button className={iconButtonClass} disabled={disabled} onClick={onClick}>
			<Icon disabled={disabled} src={icon} />
		</button>
	) : (
		<Link className={iconButtonClass} disabled={disabled} to={href}>
			<Icon disabled={disabled} src={icon} />
		</Link>
	);
};
