import React, { forwardRef, useState, useCallback } from "react";
import { InputProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
	const { icon, isError, className, classInput, disabled, type = "text", placeholder, isRequired, ...rest } = props;

	const [isFocused, setIsFocused] = useState(false);
	const [hasValue, setHasValue] = useState(false);

	const handleFocus = useCallback(() => setIsFocused(true), []);
	const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
		setIsFocused(false);
		setHasValue(!!e.target.value);
	}, []);
	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setHasValue(!!e.target.value);
	}, []);

	const placeholderText = isRequired ? `${placeholder} *` : placeholder;

	const baseClass = cn(
		"relative flex items-center pr-2.5 text-base bg-black border border-gray-500",
		"rounded-lg transition focus-within:border-white hover:border-white ",
		{ "pointer-events-none select-none": disabled },
		className,
		{ "border-error": isError }
	);

	const inputClass = cn(
		"w-full h-12 py-2.5 px-4 bg-transparent outline-none partial-border-input",
		"placeholder-transparent",
		{ "placeholder:text-gray-500": disabled },
		classInput
	);

	const labelClass = cn(
		"absolute left-4 transition-all pointer-events-none",
		{ "text-gray-500": disabled },
		{ "top-1/2 -translate-y-1/2": !isFocused && !hasValue },
		{ "-top-2 left-3 text-xs  before:bg-gray-500 px-1": isFocused || hasValue }
	);

	const borderOverlayLabelClass = cn(
		"absolute left-0 z-0 w-full h-0.5 -translate-y-1/2 top-1/2 bg-black",
		className?.split(" ").find((c) => c.startsWith("bg-"))
	);

	return (
		<div className={baseClass}>
			<input
				{...rest}
				className={inputClass}
				disabled={disabled}
				onBlur={handleBlur}
				onChange={handleChange}
				onFocus={handleFocus}
				ref={ref}
				type={type}
			/>
			<label className={labelClass}>
				<span className="relative z-10">{placeholderText}</span>
				<span className={borderOverlayLabelClass} />
			</label>
			{icon}
		</div>
	);
});

Input.displayName = "Input";
