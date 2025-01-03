import React, { ChangeEvent, FocusEvent, forwardRef, useCallback, useEffect, useId, useState } from "react";

import { TextArea } from "@interfaces/components";
import { cn } from "@utilities";

export const Textarea = forwardRef<HTMLTextAreaElement, TextArea>((props, ref) => {
	const {
		className,
		defaultValue = "",
		disabled = false,
		isError = false,
		isRequired = false,
		label,
		onBlur,
		onChange,
		placeholder,
		value,
		...rest
	} = props;

	const [isFocused, setIsFocused] = useState(false);
	const [textareaValue, setTextareaValue] = useState(value ?? defaultValue);
	const [hasValue, setHasValue] = useState(() => !!textareaValue);

	useEffect(() => {
		if (value !== undefined) {
			setTextareaValue(value);
			setHasValue(!!value);
		}
	}, [value]);

	const handleFocus = useCallback(() => {
		setIsFocused(true);
	}, []);

	const handleBlur = useCallback(
		(event: FocusEvent<HTMLTextAreaElement>) => {
			setIsFocused(false);
			setHasValue(!!textareaValue);
			onBlur?.(event);
		},
		[onBlur, textareaValue]
	);

	const handleChange = useCallback(
		(event: ChangeEvent<HTMLTextAreaElement>) => {
			const newValue = event.target.value;
			setTextareaValue(newValue);
			setHasValue(!!newValue);
			onChange?.(event);
		},
		[onChange]
	);

	const id = useId();

	const wrapperClass = cn(
		"relative flex w-full border border-gray-950 bg-black text-base text-white rounded-lg transition",
		"hover:border-white focus-within:border-white",
		{
			"border-error": isError,
			"pointer-events-none select-none border-gray-950": disabled,
		},
		className
	);

	const textareaClass = cn(
		"w-full bg-transparent px-4 py-3.5 placeholder-gray-600 outline-none rounded-lg",
		"scrollbar"
	);

	const labelClass = cn("pointer-events-none absolute left-4 opacity-0 transition-all", {
		"top-1/2 -translate-y-1/2 text-gray-600 opacity-100": !isFocused && !hasValue && !placeholder,
		"-top-2 left-3 px-1 text-xs text-white opacity-100 before:bg-gray-950": isFocused || hasValue || placeholder,
	});
	const borderOverlayLabelClass = cn("absolute left-0 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 bg-black");

	return (
		<div className={wrapperClass}>
			<textarea
				{...rest}
				autoComplete="off"
				className={textareaClass}
				disabled={disabled}
				id={id}
				onBlur={handleBlur}
				onChange={handleChange}
				onFocus={handleFocus}
				placeholder={placeholder}
				ref={ref}
				value={textareaValue}
			/>

			{label ? (
				<label className={labelClass} htmlFor={id}>
					<span className="relative z-10">{isRequired ? `${label} *` : label}</span>
					<span className={borderOverlayLabelClass} />
				</label>
			) : null}
		</div>
	);
});

Textarea.displayName = "Textarea";
