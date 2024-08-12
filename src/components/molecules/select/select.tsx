import React, { forwardRef, useCallback, useEffect, useId, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import ReactSelect, { OptionProps, SingleValue, SingleValueProps, components } from "react-select";

import { getSelectDarkStyles, getSelectLightStyles } from "@constants";
import { SelectOption, SelectProps } from "@interfaces/components";
import { cn } from "@utilities";

import { IconLabel } from "@components/molecules/select";

export const Select = forwardRef<HTMLDivElement, SelectProps>(
	(
		{
			dataTestid,
			disabled = false,
			isError = false,
			label,
			noOptionsLabel,
			onChange,
			options,
			placeholder = "Select",
			value,
			variant,
			...rest
		},
		ref
	) => {
		const [selectedOption, setSelectedOption] = useState<SingleValue<SelectOption>>(null);
		const [isFocused, setIsFocused] = useState(false);
		const [hasValue, setHasValue] = useState(false);
		const { t } = useTranslation("components", { keyPrefix: "select" });
		const { Option, SingleValue } = components;

		useEffect(() => {
			const valueSelected = options.find((option) => option.value === value?.value) || null;
			setSelectedOption(valueSelected);
			setHasValue(!!valueSelected);
		}, [value, options]);

		const handleChange = (selected: SingleValue<SelectOption>) => {
			setSelectedOption(selected);
			setHasValue(!!selected?.value);
			onChange?.(selected);
		};

		const handleFocus = useCallback(() => setIsFocused(true), []);
		const handleBlur = useCallback(() => setIsFocused(false), []);

		const noOptionsMessage = useMemo(() => noOptionsLabel || t("noOptionsAvailable"), [noOptionsLabel, t]);
		const selectStyles = useMemo(
			() =>
				variant === "light" ? getSelectLightStyles(isError, disabled) : getSelectDarkStyles(isError, disabled),
			[variant, isError, disabled]
		);

		const labelClass = cn(
			"pointer-events-none absolute left-4 top-0 text-base text-gray-600 opacity-0 transition-all",
			{ "-top-2 left-3 px-1 text-xs opacity-100 before:bg-gray-950": isFocused || hasValue },
			{
				"-top-2 left-3 px-1 text-xs opacity-100 before:bg-white":
					(isFocused || hasValue) && variant === "light",
			},
			{ "text-gray-900": variant === "light" }
		);

		const borderOverlayLabelClass = cn("absolute left-0 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 bg-black", {
			"bg-white": variant === "light",
		});

		const id = useId();

		const iconOption = (props: OptionProps<SelectOption>) => {
			const { icon, label } = props.data;

			return (
				<Option {...props}>
					<IconLabel icon={icon} label={label} />
				</Option>
			);
		};

		const iconSingleValue = (props: SingleValueProps<SelectOption>) => {
			const { icon, label } = props.data;

			return (
				<SingleValue {...props}>
					<IconLabel icon={icon} label={label} />
				</SingleValue>
			);
		};

		return (
			<div className="relative" data-testid={dataTestid} ref={ref}>
				<ReactSelect
					{...rest}
					components={{ Option: iconOption, SingleValue: iconSingleValue }}
					id={id}
					isDisabled={disabled}
					isOptionDisabled={(option) => !!option.disabled}
					noOptionsMessage={() => noOptionsMessage}
					onBlur={handleBlur}
					onChange={handleChange}
					onFocus={handleFocus}
					options={options}
					placeholder={placeholder}
					styles={selectStyles}
					value={selectedOption}
				/>

				<label className={labelClass} htmlFor={id}>
					<span className="relative z-10">{label}</span>

					<span className={borderOverlayLabelClass} />
				</label>
			</div>
		);
	}
);

Select.displayName = "Select";
