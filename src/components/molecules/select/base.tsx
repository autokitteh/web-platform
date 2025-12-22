import React, { forwardRef, useCallback, useEffect, useId, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import {
	CSSObjectWithLabel,
	GroupBase,
	GroupHeadingProps,
	OptionProps,
	SingleValue,
	SingleValueProps,
	StylesConfig,
	components,
} from "react-select";

import { getSelectDarkStyles, getSelectLightStyles } from "@constants";
import { SelectGroup, SelectOption, BaseSelectProps } from "@interfaces/components";
import { cn } from "@utilities";

import { Hint } from "@components/atoms";
import { ConnectionIconLabel } from "@components/molecules/select";

export const BaseSelect = forwardRef<HTMLDivElement, BaseSelectProps>(
	(
		{
			SelectComponent,
			createLabel,
			dataTestid,
			defaultValue,
			disabled = false,
			hint,
			isClearable = false,
			isError = false,
			isRequired = false,
			label,
			noOptionsLabel,
			onChange,
			onCreateOption,
			options,
			groups,
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

		const isGrouped = !!groups && groups.length > 0;

		const allOptions = useMemo(() => {
			if (isGrouped) {
				return groups.flatMap((group) => group.options);
			}
			return options || [];
		}, [isGrouped, groups, options]);

		useEffect(() => {
			const valueSelected = allOptions.find((option) => option.value === value?.value) || null;
			setSelectedOption(valueSelected);
		}, [value, allOptions]);

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
		const baseStyles = useMemo(
			() =>
				variant === "light" ? getSelectLightStyles(isError, disabled) : getSelectDarkStyles(isError, disabled),
			[variant, isError, disabled]
		);

		const selectStyles = useMemo((): StylesConfig<SelectOption, false, GroupBase<SelectOption>> => {
			if (!isGrouped) {
				return baseStyles;
			}
			return {
				...baseStyles,
				group: (provided: CSSObjectWithLabel) => ({
					...provided,
					paddingTop: 0,
					paddingBottom: 0,
				}),
				groupHeading: (provided: CSSObjectWithLabel) => ({
					...provided,
					color: variant === "light" ? "#6b7280" : "#9ca3af",
					fontSize: "11px",
					fontWeight: 600,
					textTransform: "uppercase" as const,
					letterSpacing: "0.05em",
					padding: "8px 12px 4px 12px",
					marginBottom: 0,
				}),
			};
		}, [baseStyles, isGrouped, variant]);

		const labelClass = useMemo(
			() =>
				cn(
					"pointer-events-none absolute -top-1 left-4 text-base text-gray-200 opacity-0 transition-all",
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
			const { ariaLabel, icon, iconClassName, label, isHighlighted, highlightLabel, connectionStatus } =
				props.data;
			return (
				<Option {...props} innerProps={{ ...props.innerProps, "aria-label": ariaLabel || label }}>
					<ConnectionIconLabel
						connectionStatus={connectionStatus}
						highlightLabel={highlightLabel}
						icon={icon}
						iconClassName={iconClassName}
						isHighlighted={isHighlighted}
						label={label}
					/>
				</Option>
			);
		};

		const iconSingleValue = (props: SingleValueProps<SelectOption>) => {
			const { icon, iconClassName, label, isHighlighted, highlightLabel, connectionStatus } = props.data;

			return (
				<SingleValue {...props}>
					<ConnectionIconLabel
						connectionStatus={connectionStatus}
						highlightLabel={highlightLabel}
						icon={icon}
						iconClassName={iconClassName}
						isHighlighted={isHighlighted}
						label={label}
					/>
				</SingleValue>
			);
		};

		const iconGroupHeading = (props: GroupHeadingProps<SelectOption, false, GroupBase<SelectOption>>) => {
			const { GroupHeading } = components;
			const groupData = props.data as SelectGroup;

			if (groupData.hideHeader) {
				return null;
			}

			const GroupIcon = groupData.icon;
			const iconClassName = groupData.iconClassName || "fill-white";

			return (
				<GroupHeading {...props}>
					<div className="flex items-center gap-2">
						{GroupIcon ? <GroupIcon className={`!size-3.5 ${iconClassName}`} /> : null}
						<span>{props.data.label}</span>
					</div>
				</GroupHeading>
			);
		};

		const defaultCreateLabel = t("creatableSelectDefaultCreateLabel");

		const selectTestId = value?.value
			? `${dataTestid || label}-${value.value}-selected`
			: `${dataTestid || label}-${dataTestid ? "empty" : "select-empty"}`;

		const selectOptions = isGrouped ? groups : options;

		return (
			<>
				<div className="relative" data-testid={selectTestId} ref={ref}>
					<SelectComponent
						{...rest}
						classNamePrefix="react-select"
						components={{
							Option: iconOption,
							SingleValue: iconSingleValue,
							...(isGrouped && { GroupHeading: iconGroupHeading }),
						}}
						formatCreateLabel={(createLabelItem) =>
							`${createLabel || defaultCreateLabel} "${createLabelItem}"`
						}
						id={id}
						isClearable={isClearable}
						isDisabled={disabled}
						isOptionDisabled={(option: SelectOption) => !!option.disabled}
						noOptionsMessage={noOptionsMessage}
						onBlur={handleBlur}
						onChange={handleChange}
						onCreateOption={onCreateOption}
						onFocus={handleFocus}
						options={selectOptions}
						placeholder={isRequired ? `${placeholder} *` : placeholder}
						styles={selectStyles}
						value={selectedOption || defaultValue}
					/>

					<label className={labelClass} htmlFor={id}>
						<span className="relative z-10">{isRequired ? `${label} *` : label}</span>
						<span className={borderOverlayLabelClass} />
					</label>
				</div>
				{hint ? <Hint>{hint}</Hint> : null}
			</>
		);
	}
);

BaseSelect.displayName = "BaseSelect";
