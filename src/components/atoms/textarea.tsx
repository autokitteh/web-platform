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

	const [state, setState] = useState({
		isFocused: false,
		textareaValue: value || defaultValue,
		hasValue: !!(value || defaultValue),
	});

	useEffect(() => {
		if (value !== undefined) {
			setState((prev) => ({
				...prev,
				textareaValue: value,
				hasValue: !!value,
			}));
		}
	}, [value]);

	const handleFocus = useCallback(() => {
		setState((prev) => ({
			...prev,
			...(value !== undefined && { textareaValue: value, hasValue: !!value }),
			isFocused: true,
		}));
	}, [value]);

	const handleBlur = useCallback(
		(event: FocusEvent<HTMLTextAreaElement>) => {
			setState((prev) => ({
				...prev,
				isFocused: false,
				hasValue: !!prev.textareaValue,
			}));
			onBlur?.(event);
		},
		[onBlur]
	);

	const handleChange = useCallback(
		(event: ChangeEvent<HTMLTextAreaElement>) => {
			const newValue = event.target.value;
			setState((prev) => ({
				...prev,
				textareaValue: newValue,
				hasValue: !!newValue,
			}));
			onChange?.(event);
		},
		[onChange]
	);

	const id = useId();

	const wrapperClass = cn(
		"relative flex w-full rounded-lg border border-gray-950 bg-black text-base text-white transition",
		"focus-within:border-white hover:border-white",
		{
			"border-error": isError,
			"pointer-events-none select-none border-gray-950": disabled,
		},
		className
	);

	const textareaClass = cn(
		"scrollbar w-full rounded-lg bg-transparent px-4 py-3.5 outline-none placeholder:text-gray-600",
		{
			"text-gray-750": disabled,
		}
	);

	const labelClass = cn("pointer-events-none absolute left-4 opacity-0 transition-all", {
		"top-3 text-gray-600 opacity-100": !state.isFocused && !state.hasValue && !placeholder,
		"-top-2 left-3 px-1 text-xs text-white opacity-100 before:bg-gray-950":
			state.isFocused || state.hasValue || placeholder,
	});

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
				value={state.textareaValue}
			/>

			{label ? (
				<label className={labelClass} htmlFor={id}>
					<span className="relative z-10">{isRequired ? `${label} *` : label}</span>
					<span className="absolute left-0 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 bg-black" />
				</label>
			) : null}
		</div>
	);
});

Textarea.displayName = "Textarea";
