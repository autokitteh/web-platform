import React, { forwardRef, useCallback, useEffect, useId, useState } from "react";

import { InputVariant } from "@enums/components";
import { InputProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
	const {
		classInput,
		className,
		defaultValue,
		disabled,
		icon,
		isError,
		isRequired,
		label,
		onChange,
		placeholder,
		type = "text",
		value,
		variant,
		...rest
	} = props;

	const [isFocused, setIsFocused] = useState(false);
	const [inputValue, setInputValue] = useState(value || defaultValue || "");
	const [hasValue, setHasValue] = useState<boolean>(!!inputValue);

	useEffect(() => {
		if (value) {
			setInputValue(value);
			setHasValue(!!value);
		}
	}, [value]);

	const handleFocus = useCallback(() => setIsFocused(true), []);
	const handleBlur = useCallback(
		(event: React.FocusEvent<HTMLInputElement>) => {
			setIsFocused(false);
			const newValue = !!event.target.value;
			if (newValue !== hasValue) {
				setHasValue(newValue);
			}
		},
		[hasValue]
	);

	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = event.target.value;
			setInputValue(newValue);
			setHasValue(!!newValue);
			onChange?.(event);
		},
		[onChange]
	);

	const labelText = isRequired ? `${label} *` : label;

	const baseClass = cn(
		"relative flex items-center border border-gray-950 bg-black pr-2.5 text-base",
		"rounded-lg transition focus-within:border-white hover:border-white",
		{ "bg-white focus-within:border-gray-1100 hover:border-gray-1100": variant === InputVariant.light },
		{ "border-white": hasValue && variant !== InputVariant.light },
		{ "pointer-events-none select-none border-gray-950": disabled },
		className,
		{ "border-error": isError }
	);

	const inputClass = cn(
		"h-12 w-full bg-transparent px-4 py-2.5 placeholder-gray-600 outline-none",
		{ "text-gray-750": disabled },
		{ "autofill-black": variant === InputVariant.light && !disabled },
		{ "autofill-gray-1100": variant === InputVariant.light && disabled },
		classInput
	);

	const labelClass = cn(
		"pointer-events-none absolute left-4 opacity-0 transition-all",
		{ "top-1/2 -translate-y-1/2 text-gray-600 opacity-100": !isFocused && !hasValue && !placeholder },
		{ "-top-2 left-3 px-1 text-xs text-white opacity-100 before:bg-gray-950": isFocused || hasValue },
		{ "text-gray-900": variant === InputVariant.light },
		{ "-top-2 left-3 px-1 text-xs before:bg-white": (isFocused || hasValue) && variant === InputVariant.light },
		{ "text-black": variant === InputVariant.light },
		{
			"-top-2 left-3 translate-y-0 px-1 text-xs text-white opacity-100": placeholder,
		}
	);

	const borderOverlayLabelClass = cn("absolute left-0 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 bg-black", {
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
				placeholder={placeholder}
				ref={ref}
				type={type}
				value={inputValue}
			/>

			{labelText ? (
				<label className={labelClass} htmlFor={id}>
					<span className="relative z-10">{labelText}</span>

					<span className={borderOverlayLabelClass} />
				</label>
			) : null}

			{icon}
		</div>
	);
});

Input.displayName = "Input";