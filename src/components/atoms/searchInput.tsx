import React, { forwardRef, useCallback, useEffect, useId, useState } from "react";

import { useTranslation } from "react-i18next";

import { InputProps } from "@interfaces/components";
import { cn } from "@utilities";

import { IconButton } from "@components/atoms";
import { IconSvg } from "@components/atoms/icons";

import { Close, SearchIcon } from "@assets/image/icons";

export const SearchInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
	const {
		classInput,
		className,
		defaultValue,
		disabled,
		onChange,
		type = "text",
		value,
		hidden,
		labelOverlayClassName,
		...rest
	} = props;

	const [isFocused, setIsFocused] = useState(false);
	const [hasValue, setHasValue] = useState<boolean>();
	const { t } = useTranslation("components", { keyPrefix: "inputs" });

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

	const baseClass = cn(
		"relative flex items-center border border-gray-950 pr-2.5 text-base text-black",
		"rounded-lg transition",
		{ "pointer-events-none select-none border-gray-950": disabled },
		className
	);

	const inputClass = cn(
		"h-8 w-full bg-transparent px-4 py-2.5 text-xs text-black outline-none",
		{ "text-gray-750": disabled },
		classInput
	);

	const labelClass = cn(
		"pointer-events-none absolute left-12 text-gray-850 transition-all",
		{ "top-1/2 -translate-y-1/2": !isFocused && !hasValue },
		{ "-top-2 left-6 px-1 text-xs before:bg-gray-950": isFocused || hasValue }
	);

	const borderOverlayLabelClass = cn(
		"absolute left-0 top-1/2 z-0 h-0.5 w-full -translate-y-1/2",
		labelOverlayClassName
	);

	const id = useId();

	const reset = useCallback(() => {
		setHasValue(false);
		if (!onChange) return;
		const input = document.getElementById(id) as HTMLInputElement;
		if (input) {
			Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, "");
			input.dispatchEvent(new Event("input", { bubbles: true }));
		}
		onChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
	}, [onChange, id]);

	if (hidden) return null;
	const placeholderText = t("searchInput.placeholder");

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
			{value ? (
				<IconButton ariaLabel={t("clear")} className="absolute right-0" onClick={reset} variant="flatText">
					<Close className="fill-black" />
				</IconButton>
			) : null}
		</div>
	);
});

SearchInput.displayName = "SearchInput";
