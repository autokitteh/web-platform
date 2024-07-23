import React, { forwardRef, useCallback, useEffect, useId, useState } from "react";

import { InputVariant } from "@enums/components";
import { SecretInputProps } from "@interfaces/components";
import { cn } from "@utilities";

import { IconSvg } from "@components/atoms/icons";

import { LockIcon, UnlockedLockIcon } from "@assets/image/icons";

export const SecretInput = forwardRef<HTMLInputElement, SecretInputProps>((props, ref) => {
	const {
		classInput,
		className,
		defaultValue,
		disabled,
		isError,
		isLocked,
		isLockedDisabled,
		isRequired,
		onChange,
		onFocus,
		onLock,
		placeholder,
		register,
		value,
		variant,
		...rest
	} = props;

	const [isFocused, setIsFocused] = useState(false);
	const [hasValue, setHasValue] = useState<boolean>();

	useEffect(() => {
		setHasValue(!!value || !!defaultValue);
	}, [value, defaultValue]);

	const handleFocus = useCallback(() => {
		setIsFocused(true);
		onFocus?.();
	}, [onFocus]);

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
		"relative flex items-center border border-gray-500 bg-black text-base",
		"w-full rounded-lg transition focus-within:border-white hover:border-white",
		{
			"border-gray-black-900 bg-white text-black focus-within:border-gray-800 hover:border-gray-800":
				variant === InputVariant.light,
		},
		{ "border-white": hasValue && variant !== InputVariant.light },
		{ "pointer-events-none select-none border-gray-500": disabled },
		className,
		{ "border-error": isError }
	);

	const wrapperClass = cn(baseClass, "pr-2.5");

	const inputClass = cn(
		"h-12 w-full bg-transparent px-4 py-2.5 outline-none",
		{ "text-gray-400": disabled },
		{ "autofill-black": variant === InputVariant.light && !disabled },
		{ "autofill-gray-700": variant === InputVariant.light && disabled },
		classInput
	);

	const labelClass = cn(
		"pointer-events-none absolute left-4 text-white transition-all",
		{ "top-1/2 -translate-y-1/2": !isFocused && !hasValue },
		{ "-top-2 left-3 px-1 text-xs before:bg-gray-500": isFocused || hasValue },
		{ "-top-2 left-3 px-1 text-xs before:bg-white": (isFocused || hasValue) && variant === InputVariant.light },
		{ "text-black": variant === InputVariant.light }
	);

	const borderOverlayLabelClass = cn("absolute left-0 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 bg-black", {
		"bg-white": variant === InputVariant.light,
	});

	const iconClass = cn(baseClass, "ml-2 flex w-14 items-center justify-center");

	const id = useId();

	const inputType = isLocked ? "password" : "text";

	const lockedIcon = isLocked ? UnlockedLockIcon : LockIcon;

	return (
		<div className="flex flex-row">
			<div className={wrapperClass}>
				<input
					{...rest}
					{...register} // Spread the register object here
					className={inputClass}
					defaultValue={defaultValue}
					disabled={disabled}
					id={id}
					onBlur={handleBlur}
					onChange={handleChange}
					onFocus={handleFocus}
					placeholder={placeholderText}
					ref={ref}
					type={inputType}
					value={value}
				/>

				<label className={labelClass} htmlFor={id}>
					<span className="relative z-10">{placeholderText}</span>

					<span className={borderOverlayLabelClass} />
				</label>

				{isLockedDisabled ? (
					<button onClick={onLock} type="button">
						<IconSvg className="mr-2" size="md" src={LockIcon} />
					</button>
				) : null}
			</div>

			{!isLockedDisabled ? (
				<button className={iconClass} onClick={onLock} type="button">
					<IconSvg size="md" src={lockedIcon} />
				</button>
			) : null}
		</div>
	);
});

SecretInput.displayName = "SecretInput";
