import React from "react";
import { Link } from "@components/atoms";
import { ButtonVariant } from "@enums/components";
import { ButtonProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Button = ({
	children,
	className,
	variant,
	href,
	disabled,
	type = "button",
	form,
	ariaLabel,
	title,
	onClick,
}: Partial<ButtonProps>) => {
	const buttonClass = cn(
		"flex items-center gap-2.5 p-2 rounded-3xl transition",
		"duration-300 text-gray-700 text-center hover:bg-gray-800 hover:text-current",
		{
			"bg-black text-white": variant === ButtonVariant.filled,
			"border border-gray-400": variant === ButtonVariant.outline,
		},
		{
			"opacity-30 pointer-events-none": disabled,
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
