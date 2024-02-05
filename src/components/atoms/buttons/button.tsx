import React from "react";
import { Link } from "@components/atoms";
import { EButtonVariant } from "@enums";
import { IButton } from "@interfaces";
import { cn } from "@utilities";

export const Button = ({ children, className, variant, href, disabled }: Partial<IButton>) => {
	const buttonClass = cn(
		"w-full flex items-center gap-2.5 p-2 rounded-3xl transition",
		"duration-300 text-gray-700 text-center hover:bg-gray-800",
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
		<button className={buttonClass} disabled={disabled}>
			{children}
		</button>
	) : (
		<Link className={buttonClass} disabled={disabled} to={href}>
			{children}
		</Link>
	);
};
