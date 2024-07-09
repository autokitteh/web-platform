import React from "react";

import { ButtonVariant } from "@enums/components";
import { IconButtonProps } from "@interfaces/components";
import { cn } from "@utilities";

import { Button, Link } from "@components/atoms";

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
		"flex shrink-0 items-center justify-center rounded-full p-2 outline-0 transition duration-300 hover:bg-gray-700",
		{
			"bg-black": variant === ButtonVariant.filled,
			"border border-gray-400 hover:border-transparent": variant === ButtonVariant.outline,
		},
		{
			"cursor-not-allowed opacity-40": disabled,
			"hover:border-gray-400": disabled && variant === ButtonVariant.outline,
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
