import React from "react";
import { Link } from "@components/atoms";
import { IButton, EButtonVariant, EButtonColor } from "@components/atoms/buttons";
import { cn } from "@utils";

export const Button = ({ children, className, variant, color, href, disabled }: Partial<IButton>) => {
	const buttonClass = cn(
		"w-full flex items-center gap-2.5 p-2 rounded-3xl transition" +
			" duration-300 text-gray-700 text-center hover:bg-gray-800",
		{
			"hover:bg-transparent": variant === EButtonVariant.transparent,
			"bg-black text-white": variant === EButtonVariant.filled,
			"border border-gray-400": variant === EButtonVariant.outline,
		},
		{
			"text-white": color === EButtonColor.white,
			"text-black": color === EButtonColor.black,
			"text-gray-700": color === EButtonColor.gray,
		},
		{
			"text-gray-400 pointer-events-none": disabled,
			"border-gray-500": disabled && variant === EButtonVariant.outline,
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
