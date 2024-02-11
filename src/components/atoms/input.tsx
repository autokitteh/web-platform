import React from "react";
import { IInput } from "@interfaces/components";
import { cn } from "@utilities";

export const Input = ({
	icon,
	type = "text",
	placeholder = "Enter text",
	className,
	error,
	disabled,
}: Partial<IInput>) => {
	const baseStyle = cn(
		"flex items-center pr-2.5 text-base bg-black-900 border border-gray-500",
		"rounded-lg overflow-hidden transition focus:border-white hover:border-white",
		{ "border-error": error },
		{ "pointer-events-none select-none": disabled },
		className
	);

	const inputStyle = cn(
		"w-full h-12 py-2.5 px-4 bg-transparent",
		"placeholder:font-light placeholder:text-white hover:placeholder:font-medium",
		{ "placeholder:text-gray-500": disabled }
	);

	return (
		<div className={baseStyle}>
			<input className={inputStyle} disabled={disabled} placeholder={placeholder} type={type} />
			{icon}
		</div>
	);
};
