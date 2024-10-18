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
		"hover:text-current text-center duration-300 hover:bg-gray-1250 text-white px-3",
		{
			"bg-black": variant === ButtonVariant.filled,
			"bg-gray-1200 hover:bg-gray-1050": variant === ButtonVariant.filledGray,
			"bg-transparent hover:bg-gray-500": variant === ButtonVariant.light,
			"border border-gray-750 hover:bg-black hover:border-white": variant === ButtonVariant.outline,
			"border border-gray-750 hover:border-white border-black bg-white": variant === ButtonVariant.inverse,
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
