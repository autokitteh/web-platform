import React, { useState, useEffect } from "react";
import { getSelectBlackStyles, getSelectWhiteStyles } from "@constants";
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
	ref = null,
	noOptionsLabel,
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
		case "white":
			selectStyles = getSelectWhiteStyles(isError);
			break;
		default:
			selectStyles = getSelectBlackStyles(isError);
			break;
	}

	return (
		<ReactSelect
			{...rest}
			isOptionDisabled={(option) => !!option.disabled}
			noOptionsMessage={() => noOptionsMessage}
			onChange={handleChange}
			onMenuClose={handleMenuClose}
			options={options}
			placeholder={placeholder}
			ref={ref}
			styles={selectStyles}
			value={selectedOption}
		/>
	);
};
