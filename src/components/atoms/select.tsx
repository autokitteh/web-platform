import React, { useState, useEffect } from "react";
import { getSelectDarkStyles, getSelectLightStyles } from "@constants";
import { SelectProps, SelectOption } from "@interfaces/components";
import { useTranslation } from "react-i18next";
import ReactSelect, { SingleValue } from "react-select";

export const Select = ({
	placeholder = "Select",
	value,
	options,
	isError = false,
	variant,
	onChange,
	noOptionsLabel,
	dataTestid,
	...rest
}: SelectProps) => {
	const [selectedOption, setSelectedOption] = useState<SingleValue<SelectOption>>();
	const { t } = useTranslation("components", { keyPrefix: "select" });

	useEffect(() => {
		setSelectedOption(options.find((option) => option.value === value?.value));
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
			selectStyles = getSelectLightStyles(isError);
			break;
		default:
			selectStyles = getSelectDarkStyles(isError);
			break;
	}

	return (
		<div data-testid={dataTestid}>
			<ReactSelect
				{...rest}
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
};
