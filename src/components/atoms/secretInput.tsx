import React, { forwardRef, useCallback, useEffect, useId, useState } from "react";

import { useTranslation } from "react-i18next";

import { Button } from "./buttons";
import { Hint } from "./hint";
import { ButtonVariant, InputVariant } from "@enums/components";
import { SecretInputProps } from "@interfaces/components";
import { cn } from "@utilities";

import { IconSvg } from "@components/atoms/icons";

import { EyeCloseIcon, EyeIcon, LockIcon, UnlockedLockIcon } from "@assets/image/icons";

export const SecretInput = forwardRef<HTMLInputElement, SecretInputProps>((props, ref) => {
	const {
		classInput,
		className,
		defaultValue,
		disabled,
		handleInputChange,
		handleLockAction,
		hint,
		isError,
		isLocked = false,
		isLockedDisabled,
		isRequired,
		label,
		onChange,
		onFocus,
		placeholder,
		type,
		value,
		variant,
		...rest
	} = props;

	const { t } = useTranslation("components", { keyPrefix: "inputs" });
	const [innerValue, setInnerValue] = useState(value);

	const [isFocused, setIsFocused] = useState<boolean>(false);
	const [hasValue, setHasValue] = useState<boolean>();

	const handleFocus = () => {
		onFocus?.();
		setIsFocused(true);
	};

	useEffect(() => {
		setHasValue(!!value || !!defaultValue);
		if (value) {
			setInnerValue(value);
		}
	}, [value, defaultValue]);

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
			setInnerValue(event.target.value);
			handleInputChange?.(event.target.value);
			onChange?.(event);
		},
		[hasValue, handleInputChange, onChange]
	);

	const labelText = isRequired ? `${label} *` : label;

	const baseClass = cn(
		"relative flex items-center border border-gray-950 bg-black text-base",
		"w-full rounded-lg transition focus-within:border-white hover:border-white",
		{
			"border-gray-black-900 bg-white text-black focus-within:border-gray-800 hover:border-gray-800":
				variant === InputVariant.light,
		},
		{ "border-white": hasValue && variant !== InputVariant.light },
		{ "pointer-events-none select-none border-gray-950": disabled },
		className,
		{ "border-error": isError }
	);

	const wrapperClass = cn(baseClass, "pr-2.5");

	const inputClass = cn(
		"h-12 w-full bg-transparent px-4 py-2.5 outline-none placeholder:text-gray-600",
		{ "text-gray-400": disabled },
		{ "text-white": variant === InputVariant.dark },
		{ "placeholder:text-gray-1000": variant === InputVariant.light },
		{ "autofill-black": variant === InputVariant.light && !disabled },
		{ "autofill-gray-700": variant === InputVariant.light && disabled },
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

	const iconClass = cn(baseClass, "ml-2 flex w-14 items-center justify-center");

	const id = useId();

	const inputType = isLocked ? "password" : "text";

	const lockedIcon = (() => {
		if (type === "password") {
			return isLocked ? EyeIcon : EyeCloseIcon;
		}

		return isLocked ? UnlockedLockIcon : LockIcon;
	})();

	const buttonTitle = isLocked ? t("secretInput.unlock") : t("secretInput.lock");
	const buttonVariant = (variant === InputVariant.light ? "light" : "dark") as ButtonVariant;
	const iconFill = variant === InputVariant.light ? "fill-black" : "fill-white";
	const disabledButtonClass = cn("mr-2", iconFill);

	const handleLockedStateAction = () => {
		handleLockAction?.(!isLocked);
	};

	return (
		<>
			<div className="flex flex-row">
				<div className={wrapperClass}>
					<input
						{...rest}
						className={inputClass}
						data-dd-privacy="mask"
						defaultValue={defaultValue}
						disabled={disabled}
						id={id}
						onBlur={handleBlur}
						onChange={handleChange}
						onFocus={handleFocus}
						placeholder={placeholder}
						ref={ref}
						type={inputType}
						value={innerValue || ""}
					/>

					{labelText ? (
						<label className={labelClass} htmlFor={id}>
							<span className="relative z-10">{labelText}</span>

							<span className={borderOverlayLabelClass} />
						</label>
					) : null}

					{isLockedDisabled ? (
						<Button onClick={handleLockedStateAction} type="button" variant={buttonVariant}>
							<IconSvg className={disabledButtonClass} size="md" src={LockIcon} />
						</Button>
					) : null}
				</div>

				{!isLockedDisabled ? (
					<Button
						className={iconClass}
						onClick={handleLockedStateAction}
						title={buttonTitle}
						type="button"
						variant={buttonVariant}
					>
						<IconSvg className={iconFill} size="md" src={lockedIcon} />
					</Button>
				) : null}
			</div>
			{hint ? <Hint>{hint}</Hint> : null}
		</>
	);
});

SecretInput.displayName = "SecretInput";
