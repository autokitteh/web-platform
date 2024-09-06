import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { Control, useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ReactSelect, {
	GroupBase,
	OptionProps,
	SelectInstance,
	SingleValue,
	SingleValueProps,
	components,
} from "react-select";

import { getSelectDarkStyles, getSelectLightStyles } from "@constants";
import { SelectOption, SelectProps } from "@interfaces/components";
import { cn } from "@utilities";

import { IconLabel } from "@components/molecules/select";

interface ExtendedSelectProps extends Omit<SelectProps, "ref"> {
	control?: Control<any>;
	name: string;
}

export const Select = forwardRef<HTMLDivElement, ExtendedSelectProps>(
	(
		{
			control,
			dataTestid,
			disabled = false,
			isError = false,
			label,
			name,
			noOptionsLabel,
			onChange,
			options,
			placeholder = "Select",
			value: propValue,
			variant,
			...rest
		},
		ref
	) => {
		const selectRef = useRef<SelectInstance<SelectOption, false, GroupBase<SelectOption>> | null>(null);
		const useControllerProps = control ? { control, name } : undefined;
		const {
			field: { onBlur, onChange: fieldOnChange, ref: fieldRef, value },
		} = useController(useControllerProps || { name });

		const [selectedOption, setSelectedOption] = useState<SingleValue<SelectOption>>(null);
		const [isFocused, setIsFocused] = useState(false);
		const { t } = useTranslation("components", { keyPrefix: "select" });
		const { Option, SingleValue } = components;

		useEffect(() => {
			const valueSelected = options.find((option) => option.value === (value || propValue)?.value) || null;
			setSelectedOption(valueSelected);
		}, [value, propValue, options]);

		const handleChange = useCallback(
			(selected: SingleValue<SelectOption>) => {
				setSelectedOption(selected);
				fieldOnChange(selected);
				onChange?.(selected);
			},
			[onChange, fieldOnChange]
		);

		const handleFocus = useCallback(() => setIsFocused(true), []);
		const handleBlur = useCallback(() => {
			setIsFocused(false);
			onBlur();
		}, [onBlur]);

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

		useEffect(() => {
			if (selectRef.current) {
				const inputElement = selectRef.current.inputRef;
				fieldRef(inputElement);
			}
		}, [fieldRef]);

		return (
			<div className="relative" data-testid={dataTestid} ref={ref}>
				<ReactSelect
					{...rest}
					components={{ Option: iconOption, SingleValue: iconSingleValue }}
					id={id}
					isDisabled={disabled}
					isOptionDisabled={(option) => !!option.disabled}
					noOptionsMessage={noOptionsMessage}
					onBlur={handleBlur}
					onChange={handleChange}
					onFocus={handleFocus}
					options={options}
					placeholder={placeholder}
					ref={(instance) => {
						selectRef.current = instance;
					}}
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
