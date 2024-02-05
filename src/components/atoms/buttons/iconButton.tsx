import React from "react";
import { Link } from "@components/atoms";
import { IButton, EButtonVariant } from "@components/atoms/buttons";
import { cn } from "@utils";

interface IIconButtonProps extends Partial<IButton> {
	children: React.ReactNode;
}

export const IconButton = ({
	children,
	className,
	variant,
	href,
	disabled,
	onMouseEnter,
	onMouseLeave,
	onClick,
}: IIconButtonProps) => {
	const iconButtonClass = cn(
		"p-2 flex items-center justify-center rounded-full transition duration-300 hover:bg-gray-800 shrink-0 outline-0",
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
		<button
			className={iconButtonClass}
			disabled={disabled}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			{children}
		</button>
	) : (
		<Link className={iconButtonClass} disabled={disabled} to={href}>
			{children}
		</Link>
	);
};
