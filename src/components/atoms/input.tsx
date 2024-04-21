import React, { forwardRef } from "react";
import { InputProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
	const { icon, isError, className, classInput, disabled, type = "text", placeholder, isRequired, ...rest } = props;

	const placeholderModif = isRequired ? `* ${placeholder}` : placeholder;

	const baseStyle = cn(
		"flex items-center pr-2.5 text-base bg-black border border-gray-500",
		"rounded-lg overflow-hidden transition focus:border-white hover:border-white",
		{ "pointer-events-none select-none": disabled },
		className,
		{ "border-error": isError }
	);

	const inputStyle = cn(
		"w-full h-12 py-2.5 px-4 bg-transparent",
		"placeholder:font-light placeholder:text-white hover:placeholder:font-medium",
		{ "placeholder:text-gray-500": disabled },
		classInput
	);

	return (
		<div className={baseStyle}>
			<input
				{...rest}
				className={inputStyle}
				disabled={disabled}
				placeholder={placeholderModif}
				ref={ref}
				type={type}
			/>
			{icon}
		</div>
	);
});

Input.displayName = "Input";
