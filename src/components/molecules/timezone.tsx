import React, { forwardRef, useCallback, useId, useMemo, useState } from "react";

import { SingleValue } from "react-select";
import TimezoneSelect from "react-timezone-select";

import { getSelectDarkStyles, getSelectLightStyles } from "@constants";
import { SelectOption, SelectProps } from "@interfaces/components";
import { cn } from "@utilities";

import { Hint } from "@components/atoms";

const defaultTimezone = { label: "UTC", value: "UTC" };

interface TimezoneSelectProps extends Omit<SelectProps, "options" | "value" | "onChange"> {
	value?: string;
	onChange?: (value: SingleValue<SelectOption>) => void;
}

export const AkTimezoneSelect = forwardRef<HTMLDivElement, TimezoneSelectProps>(
	(
		{
			dataTestid,
			disabled = false,
			hint,
			isError = false,
			isRequired = false,
			label = "Timezone",
			onChange,
			placeholder = "Select timezone",
			value,
			variant,
			...rest
		},
		ref
	) => {
		const [selectedOption, setSelectedOption] = useState<any>(null);

		const timezoneValue = value ? { label: value, value } : defaultTimezone;

		const handleChange = useCallback(
			(selected: any) => {
				setSelectedOption(selected);
				onChange?.(selected);
			},
			[onChange]
		);

		const selectStyles = useMemo(
			() =>
				variant === "light" ? getSelectLightStyles(isError, disabled) : getSelectDarkStyles(isError, disabled),
			[variant, isError, disabled]
		);

		const labelClass = useMemo(
			() =>
				cn(
					"pointer-events-none absolute -top-2 left-3 px-1 text-xs opacity-100 transition-all before:bg-gray-950",
					{
						"before:bg-white": variant === "light",
					},
					{ "text-gray-900": variant === "light" }
				),
			[variant]
		);

		const borderOverlayLabelClass = useMemo(
			() =>
				cn("absolute left-0 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 bg-black", {
					"bg-white": variant === "light",
				}),
			[variant]
		);

		const id = useId();

		return (
			<>
				<div className="relative" data-testid={dataTestid} ref={ref}>
					<TimezoneSelect
						{...rest}
						id={id}
						isDisabled={disabled}
						onChange={handleChange}
						placeholder={isRequired ? `${placeholder} *` : placeholder}
						styles={selectStyles as any}
						value={selectedOption || timezoneValue}
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

AkTimezoneSelect.displayName = "AkTimezoneSelect";
