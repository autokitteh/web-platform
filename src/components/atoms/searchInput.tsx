import React, { forwardRef, useCallback, useEffect, useId, useState } from "react";

import { InputVariant } from "@enums/components";
import { InputProps } from "@interfaces/components";
import { cn } from "@utilities";

import { IconSvg } from "@components/atoms/icons";

import { SearchIcon } from "@assets/image/icons";

export const SearchInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
	const {
		classInput,
		className,
		defaultValue,
		disabled,
		isError,
		isRequired,
		onChange,
		placeholder,
		type = "text",
		value,
		variant,
		...rest
	} = props;

	const [isFocused, setIsFocused] = useState(false);
	const [hasValue, setHasValue] = useState<boolean>();

	useEffect(() => {
		setHasValue(!!value || !!defaultValue);
	}, [value, defaultValue]);

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
			const newValue = !!event.target.value;
			if (newValue !== hasValue) {
				setHasValue(newValue);
			}
			onChange?.(event);
		},
		[hasValue, onChange]
	);

	const placeholderText = isRequired ? `${placeholder} *` : placeholder;

	const baseClass = cn(
		"relative flex items-center border border-gray-950 bg-black pr-2.5 text-base",
		"rounded-lg transition focus-within:border-white hover:border-white",
		{
			"border-gray-650 bg-white text-black focus-within:border-gray-1250 hover:border-gray-1250":
				variant === InputVariant.light,
		},
		{ "border-white": hasValue && variant !== InputVariant.light },
		{ "pointer-events-none select-none border-gray-950": disabled },
		className,
		{ "border-error": isError }
	);

	const inputClass = cn(
		"h-12 w-full bg-transparent px-4 py-2.5 outline-none",
		{ "text-gray-750": disabled },
		{ "autofill-black": variant === InputVariant.light && !disabled },
		{ "autofill-gray-1100": variant === InputVariant.light && disabled },
		classInput
	);

	const labelClass = cn(
		"pointer-events-none absolute left-12 font-semibold text-gray-850 transition-all",
		{ "top-1/2 -translate-y-1/2": !isFocused && !hasValue },
		{ "-top-2 left-6 px-1 text-xs before:bg-gray-950": isFocused || hasValue },
		{ "-top-2 left-6 px-1 text-xs before:bg-white": (isFocused || hasValue) && variant === InputVariant.light }
	);

	const borderOverlayLabelClass = cn("absolute left-0 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 bg-black", {
		"bg-white": variant === InputVariant.light,
	});

	const id = useId();

	return (
		<div className={baseClass}>
			<IconSvg className="ml-4" size="lg" src={SearchIcon} />

			<input
				{...rest}
				className={inputClass}
				defaultValue={defaultValue}
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
		</div>
	);
});

SearchInput.displayName = "SearchInput";
