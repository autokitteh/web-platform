import React, { forwardRef, useId, useMemo } from "react";

import ReactTimezoneSelect, { useTimezoneSelect } from "react-timezone-select";

import { defaultTimezone, getSelectDarkStyles, getSelectLightStyles } from "@constants";
import { ITimezoneOption, TimezoneSelectProps } from "@interfaces/components";
import { cn } from "@utilities";

import { Hint } from "@components/atoms";

const TimezoneSelectBase = forwardRef<HTMLDivElement, TimezoneSelectProps>(
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
		const { parseTimezone } = useTimezoneSelect({});

		const timezoneValue: ITimezoneOption = value ? parseTimezone(value) : defaultTimezone;

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
						"text-gray-900": variant === "light",
						"text-white": variant !== "light",
					}
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
					<ReactTimezoneSelect
						{...rest}
						aria-required={isRequired}
						id={id}
						isDisabled={disabled}
						onChange={onChange}
						placeholder={isRequired ? `${placeholder} *` : placeholder}
						styles={selectStyles as unknown as Parameters<typeof ReactTimezoneSelect>[0]["styles"]}
						value={timezoneValue}
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

TimezoneSelectBase.displayName = "TimezoneSelect";

export const TimezoneSelect = React.memo(TimezoneSelectBase);
