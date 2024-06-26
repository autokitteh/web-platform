import React, { forwardRef, useState, useCallback, useEffect, useId } from "react";
import { InputVariant } from "@enums/components";
import { InputProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
	const {
		icon,
		isError,
		className,
		classInput,
		disabled,
		type = "text",
		placeholder,
		isRequired,
		variant,
		value,
		onChange,
		...rest
	} = props;

	const [isFocused, setIsFocused] = useState(false);
	const [hasValue, setHasValue] = useState<boolean>();

	useEffect(() => {
		setHasValue(!!value);
	}, [value]);

	const handleFocus = useCallback(() => setIsFocused(true), []);
	const handleBlur = useCallback(
		(e: React.FocusEvent<HTMLInputElement>) => {
			setIsFocused(false);
			const newValue = !!e.target.value;
			if (newValue !== hasValue) setHasValue(newValue);
		},
		[hasValue]
	);

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = !!e.target.value;
			if (newValue !== hasValue) setHasValue(newValue);
			onChange?.(e);
		},
		[hasValue, onChange]
	);

	const placeholderText = isRequired ? `${placeholder} *` : placeholder;

	const baseClass = cn(
		"relative flex items-center pr-2.5 text-base bg-black border border-gray-500",
		"rounded-lg transition focus-within:border-white hover:border-white ",
		{ "bg-white hover:border-gray-700 focus-within:border-gray-700": variant === InputVariant.light },
		{ "pointer-events-none select-none": disabled },
		className,
		{ "border-error": isError }
	);

	const inputClass = cn(
		"w-full h-12 py-2.5 px-4 bg-transparent outline-none",
		{ "autofill-black": variant === InputVariant.light },
		{ "text-gray-400": disabled },
		classInput
	);

	const labelClass = cn(
		"absolute left-4 transition-all pointer-events-none",
		{ "top-1/2 -translate-y-1/2": !isFocused && !hasValue },
		{ "-top-2 left-3 text-xs  before:bg-gray-500 px-1": isFocused || hasValue }
	);

	const borderOverlayLabelClass = cn("absolute left-0 z-0 w-full h-0.5 -translate-y-1/2 top-1/2 bg-black", {
		"bg-white": variant === InputVariant.light,
	});

	const id = useId();

	return (
		<div className={baseClass}>
			<input
				{...rest}
				className={inputClass}
				disabled={disabled}
				id={id}
				onBlur={handleBlur}
				onChange={handleChange}
				onFocus={handleFocus}
				ref={ref}
				type={type}
				value={value}
			/>
			<label className={labelClass} htmlFor={id}>
				<span className="relative z-10">{placeholderText}</span>
				<span className={borderOverlayLabelClass} />
			</label>
			{icon}
		</div>
	);
});

Input.displayName = "Input";
