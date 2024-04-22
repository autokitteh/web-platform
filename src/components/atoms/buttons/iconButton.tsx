import React from "react";
import { Link } from "@components/atoms";
import { ButtonVariant } from "@enums/components";
import { IconButtonProps } from "@interfaces/components";
import { cn } from "@utilities";

export const IconButton = ({
	children,
	className,
	variant,
	href,
	ariaLabel,
	disabled,
	onMouseEnter,
	onMouseLeave,
	onClick,
}: IconButtonProps) => {
	const iconButtonClass = cn(
		"p-2 flex items-center justify-center rounded-full transition duration-300 hover:bg-gray-800 shrink-0 outline-0",
		{
			"bg-black": variant === ButtonVariant.filled,
			"border border-gray-400 hover:border-transparent": variant === ButtonVariant.outline,
		},
		{
			"opacity-40 cursor-not-allowed": disabled,
			"hover:border-gray-400": disabled && variant === ButtonVariant.outline,
		},
		className
	);

	return !href ? (
		<button
			aria-label={ariaLabel}
			className={iconButtonClass}
			data-tooltip="{ariaLabel}"
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
