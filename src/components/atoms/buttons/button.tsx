import React from "react";
import { Link } from "@components/atoms";
import { EButtonVariant } from "@enums/components";
import { IButton } from "@interfaces/components";
import { cn } from "@utilities";

export const Button = ({
	children,
	className,
	variant,
	href,
	disabled,
	type,
	onClick,
	ariaLabel,
}: Partial<IButton>) => {
	const buttonClass = cn(
		"w-full flex items-center gap-2.5 p-2 rounded-3xl transition",
		"duration-300 text-gray-700 text-center hover:bg-gray-800 hover:text-current",
		{
			"bg-black text-white": variant === EButtonVariant.filled,
			"border border-gray-400": variant === EButtonVariant.outline,
		},
		{
			"opacity-30 pointer-events-none": disabled,
		},
		className
	);

	return !href ? (
		<button aria-label={ariaLabel} className={buttonClass} disabled={disabled} onClick={onClick} type={type}>
			{children}
		</button>
	) : (
		<Link className={buttonClass} disabled={disabled} to={href}>
			{children}
		</Link>
	);
};
