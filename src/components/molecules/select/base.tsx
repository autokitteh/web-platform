import React, { forwardRef, useCallback, useEffect, useId, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import ReactSelect, { OptionProps, SingleValue, SingleValueProps, components } from "react-select";
import CreatableSelect from "react-select/creatable";

import { getSelectDarkStyles, getSelectLightStyles } from "@constants";
import { SelectOption, SelectProps } from "@interfaces/components";
import { cn } from "@utilities";

import { IconLabel } from "@components/molecules/select";

interface BaseSelectProps extends SelectProps {
	SelectComponent: typeof ReactSelect | typeof CreatableSelect;
	defaultValue?: SingleValue<SelectOption>;
}

export const BaseSelect = forwardRef<HTMLDivElement, BaseSelectProps>(
	(
		{
			SelectComponent,
			createLabel,
			dataTestid,
			defaultValue,
			disabled = false,
			isError = false,
			isRequired = false,
			label,
			noOptionsLabel,
			onChange,
			onCreateOption,
			options,
			placeholder,
			value,
			variant,
			...rest
		},
		ref
	) => {
		const [selectedOption, setSelectedOption] = useState<SingleValue<SelectOption>>(null);
		const [isFocused, setIsFocused] = useState(false);
		const { t } = useTranslation("components", { keyPrefix: "select" });
		const { Option, SingleValue } = components;

		useEffect(() => {
			const valueSelected = options.find((option) => option.value === value?.value) || null;
			setSelectedOption(valueSelected);
		}, [value, options]);

		const handleChange = useCallback(
			(selected: SingleValue<SelectOption>) => {
				setSelectedOption(selected);
				onChange?.(selected);
			},
			[onChange]
		);

		const handleFocus = useCallback(() => setIsFocused(true), []);
		const handleBlur = useCallback(() => setIsFocused(false), []);

		const noOptionsMessage = useMemo(() => () => noOptionsLabel || t("noOptionsAvailable"), [noOptionsLabel, t]);
		const selectStyles = useMemo(
			() =>
				variant === "light" ? getSelectLightStyles(isError, disabled) : getSelectDarkStyles(isError, disabled),
			[variant, isError, disabled]
		);

		const labelClass = useMemo(
			() =>
				cn(
					"pointer-events-none absolute -top-1 left-4 text-base opacity-0 transition-all",
					{ "-top-2 left-3 px-1 text-xs opacity-100 before:bg-gray-950": isFocused || !!selectedOption },
					{
						"-top-2 left-3 px-1 text-xs opacity-100 before:bg-white":
							(isFocused || !!selectedOption) && variant === "light",
					},
					{ "text-gray-900": variant === "light" }
				),
			[isFocused, selectedOption, variant]
		);

		const borderOverlayLabelClass = useMemo(
			() =>
				cn("absolute left-0 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 bg-black", {
					"bg-white": variant === "light",
				}),
			[variant]
		);

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

		const defaultCreateLabel = t("creatableSelectDefaultCreateLabel");

		return (
			<div className="relative" data-testid={dataTestid} ref={ref}>
				<SelectComponent
					{...rest}
					components={{ Option: iconOption, SingleValue: iconSingleValue }}
					formatCreateLabel={(createLabelItem) => `${createLabel || defaultCreateLabel} "${createLabelItem}"`}
					id={id}
					isDisabled={disabled}
					isOptionDisabled={(option: SelectOption) => !!option.disabled}
					noOptionsMessage={noOptionsMessage}
					onBlur={handleBlur}
					onChange={handleChange}
					onCreateOption={onCreateOption}
					onFocus={handleFocus}
					options={options}
					placeholder={isRequired ? `${placeholder} *` : placeholder}
					styles={selectStyles}
					value={selectedOption || defaultValue}
				/>

				<label className={labelClass} htmlFor={id}>
					<span className="relative z-10">{isRequired ? `${label} *` : label}</span>
					<span className={borderOverlayLabelClass} />
				</label>
			</div>
		);
	}
);

BaseSelect.displayName = "BaseSelect";
