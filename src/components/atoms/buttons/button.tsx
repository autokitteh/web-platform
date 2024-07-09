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
	title,
	type = "button",
	variant,
}: Partial<ButtonProps>) => {
	const buttonClass = cn(
		"flex items-center gap-2.5 rounded-3xl p-2 transition",
		"hover:text-current text-center text-gray-700 duration-300 hover:bg-gray-800",
		{
			"bg-black text-white": variant === ButtonVariant.filled,
			"bg-white text-gray-800 hover:bg-gray-300 hover:text-black": variant === ButtonVariant.light,
			"border border-gray-400": variant === ButtonVariant.outline,
		},
		{
			"pointer-events-none opacity-30": disabled,
		},
		className
	);

	return !href ? (
		<button
			aria-label={ariaLabel}
			className={buttonClass}
			disabled={disabled}
			form={form}
			onClick={onClick}
			title={title}
			type={type}
		>
			{children}
		</button>
	) : (
		<Link ariaLabel={ariaLabel} className={buttonClass} disabled={disabled} to={href}>
			{children}
		</Link>
	);
};
