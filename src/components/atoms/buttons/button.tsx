import React from "react";

import { ButtonVariant } from "@enums/components";
import { ButtonProps } from "@interfaces/components";
import { cn } from "@utilities";

import { Link } from "@components/atoms";

export const Button = ({
	ariaLabel,
	children,
	className,
	disabled,
	form,
	href,
	onClick,
	style,
	title,
	type = "button",
	variant,
}: Partial<ButtonProps>) => {
	const buttonClass = cn(
		"flex cursor-pointer items-center gap-2.5 rounded-3xl p-2 transition",
		"hover:text-current text-center text-gray-1100 duration-300 hover:bg-gray-1250",
		{
			"bg-black text-white": variant === ButtonVariant.filled,
			"bg-gray-1200 text-white hover:bg-gray-1050": variant === ButtonVariant.filledGray,
			"bg-white text-gray-1250 hover:bg-gray-500 hover:text-black": variant === ButtonVariant.light,
			"border border-gray-750 hover:bg-gray-1100 hover:text-white": variant === ButtonVariant.outline,
		},
		{
			"cursor-not-allowed opacity-30": disabled, // cursor-not-allowed додає стилю курсору
		},
		className
	);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (disabled) {
			event.preventDefault();

			return;
		}
		onClick?.(event);
	};

	return !href ? (
		<button
			aria-label={ariaLabel}
			className={buttonClass}
			disabled={disabled}
			form={form}
			onClick={handleClick}
			style={style}
			title={title}
			type={type}
		>
			{children}
		</button>
	) : (
		<Link ariaLabel={ariaLabel} className={buttonClass} disabled={disabled} title={title} to={href}>
			{children}
		</Link>
	);
};
