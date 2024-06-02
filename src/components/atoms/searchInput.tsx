import React, { forwardRef } from "react";
import { Search } from "@assets/image/icons";
import { IconSvg } from "@components/atoms/icons";
import { InputProps } from "@interfaces/components";
import { cn } from "@utilities";

export const SearchInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
	const { icon, isError, className, classInput, disabled, type = "text", placeholder, isRequired, ...rest } = props;

	const placeholderModif = isRequired ? `* ${placeholder}` : placeholder;

	const baseStyle = cn(
		"flex items-center text-base bg-white border border-gray-300",
		"rounded-lg overflow-hidden",
		{ "pointer-events-none select-none": disabled },
		className,
		{ "border-error": isError }
	);

	const inputStyle = cn(
		"font-averta-semi-bold w-full h-12 py-2 px-4 bg-transparent text-black-900 placeholder:text-gray-400",
		"hover:placeholder:font-medium placeholder:font-averta-semi-bold",
		{ "placeholder:text-gray-500": disabled },
		classInput
	);

	return (
		<div className={baseStyle}>
			<IconSvg className="w-5 h-5 ml-4" src={Search} />
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

SearchInput.displayName = "Input";
