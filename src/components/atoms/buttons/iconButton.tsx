import React from "react";

import { ButtonVariant } from "@enums/components";
import { IconButtonProps } from "@interfaces/components";
import { cn } from "@utilities";

import { Link } from "@components/atoms";

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
	style,
	title,
	type = "button",
	variant,
}: IconButtonProps) => {
	const iconButtonClass = cn(
		"flex shrink-0 items-center justify-center rounded-full p-2 outline-0 transition duration-300 hover:bg-gray-850",
		{
			"bg-black": variant === ButtonVariant.filled,
			"border border-gray-750 hover:border-transparent": variant === ButtonVariant.outline,
		},
		{
			"cursor-not-allowed opacity-40": disabled,
			"hover:border-gray-750": disabled && variant === ButtonVariant.outline,
		},
		className
	);

	const Component = href ? Link : "button";
	const linkHref = href ? { to: href } : { to: "" };

	return (
		<Component
			aria-label={ariaLabel}
			className={iconButtonClass}
			disabled={disabled}
			onClick={onClick}
			onKeyDown={onKeyDown}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			role="button"
			style={style}
			tabIndex={0}
			title={title}
			type={type}
			{...linkHref}
		>
			{children}
		</Component>
	);
};
