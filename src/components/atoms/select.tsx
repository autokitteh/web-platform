import React, { forwardRef, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import ReactSelect, { SingleValue } from "react-select";

import { getSelectDarkStyles, getSelectLightStyles } from "@constants";
import { SelectOption, SelectProps } from "@interfaces/components";

const Select = forwardRef<HTMLDivElement, SelectProps>(
	(
		{
			dataTestid,
			disabled = false,
			isError = false,
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
		const { t } = useTranslation("components", { keyPrefix: "select" });

		useEffect(() => {
			setSelectedOption(options.find((option) => option.value === value?.value) || null);
		}, [value, options]);

		const handleChange = (selected: SingleValue<SelectOption>) => {
			setSelectedOption(selected);
			onChange(selected);
		};

		const noOptionsMessage = noOptionsLabel || t("noOptionsAvailable");

		const handleMenuClose = () => {
			(document.activeElement as HTMLElement).blur();
		};

		let selectStyles;
		switch (variant) {
			case "light":
				selectStyles = getSelectLightStyles(isError, disabled);
				break;
			default:
				selectStyles = getSelectDarkStyles(isError, disabled);
				break;
		}

		return (
			<div data-testid={dataTestid} ref={ref}>
				<ReactSelect
					{...rest}
					isDisabled={disabled}
					isOptionDisabled={(option) => !!option.disabled}
					noOptionsMessage={() => noOptionsMessage}
					onChange={handleChange}
					onMenuClose={handleMenuClose}
					options={options}
					placeholder={placeholder}
					styles={selectStyles}
					value={selectedOption}
				/>
			</div>
		);
	}
);

Select.displayName = "Select";

export { Select };
