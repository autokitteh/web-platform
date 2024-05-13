import React, { useState, useEffect } from "react";
import { getSelectBlackStyles, getSelectWhiteStyles } from "@constants";
import { SelectProps, SelectOption } from "@interfaces/components";
import ReactSelect, { SingleValue } from "react-select";

export const Select = ({
	placeholder = "Select",
	value,
	options,
	isError = false,
	variant,
	onChange,
	...rest
}: SelectProps) => {
	const [selectedOption, setSelectedOption] = useState<SingleValue<SelectOption>>();

	useEffect(() => {
		setSelectedOption(options.find((option) => option.value === value?.value));
	}, [value, options]);

	const handleChange = (selected: SingleValue<SelectOption>) => {
		setSelectedOption(selected);
		onChange(selected);
	};

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
			defaultValue={selectedOption}
			isOptionDisabled={(option) => !!option.disabled}
			onChange={handleChange}
			onMenuClose={handleMenuClose}
			options={options}
			placeholder={placeholder}
			styles={selectStyles}
			value={selectedOption}
		/>
	);
};
