import { Button, Link } from "@components/atoms";
import { ButtonVariant } from "@enums/components";
import { IconButtonProps } from "@interfaces/components";
import { cn } from "@utilities";
import React from "react";

export const IconButton = ({
	ariaLabel,
	children,
	className,
	disabled,
	href,
	onClick,
	onKeyDown,
	onMouseEnter,
	onMouseLeave,
	title,
	variant,
}: IconButtonProps) => {
	const iconButtonClass = cn(
		"p-2 flex items-center justify-center rounded-full transition duration-300 hover:bg-gray-700 shrink-0 outline-0",
		{
			"bg-black": variant === ButtonVariant.filled,
			"border border-gray-400 hover:border-transparent": variant === ButtonVariant.outline,
		},
		{
			"hover:border-gray-400": disabled && variant === ButtonVariant.outline,
			"opacity-40 cursor-not-allowed": disabled,
		},
		className
	);

	return !href ? (
		<Button
			ariaLabel={ariaLabel}
			className={iconButtonClass}
			disabled={disabled}
			onClick={onClick}
			onKeyDown={onKeyDown}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			tabIndex={0}
			title={title}
		>
			{children}
		</Button>
	) : (
		<Link ariaLabel={ariaLabel} className={iconButtonClass} disabled={disabled} to={href}>
			{children}
		</Link>
	);
};
