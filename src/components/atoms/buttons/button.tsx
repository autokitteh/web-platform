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
	onKeyPressed,
	style,
	onMouseEnter,
	onMouseLeave,
	tabIndex,
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
			"bg-transparent text-white hover:bg-gray-500": variant === ButtonVariant.light,
			"border border-gray-750 hover:bg-black hover:border-white": variant === ButtonVariant.outline,
			"text-white hover:bg-transparent hover:border-0": variant === ButtonVariant.flatText,
		},
		{
			"pointer-events-none opacity-30": disabled,
		},
		className
	);
	const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			onKeyPressed && onKeyPressed(event);
		}
	};

	return !href ? (
		<button
			aria-label={ariaLabel}
			className={buttonClass}
			disabled={disabled}
			form={form}
			onClick={onClick}
			onKeyDown={onKeyDown}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			style={style}
			tabIndex={tabIndex}
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
