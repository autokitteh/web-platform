import React, { useState, useEffect } from "react";
import { selectStyles } from "@constants";
import { optionsSelectApp } from "@constants/lists";
import { ISelect, ISelectOption } from "@interfaces/components";
import ReactSelect, { SingleValue } from "react-select";

export const Select = ({ placeholder = "Select app", value, onBlur, onChange }: ISelect) => {
	const [selectedOption, setSelectedOption] = useState<SingleValue<ISelectOption>>();

	useEffect(() => {
		if (value) setSelectedOption(value);
	}, [value]);

	const handleChange = (value: SingleValue<ISelectOption>) => {
		onChange?.(value);
		setSelectedOption(value);
	};

	const handleMenuClose = () => {
		onBlur?.();
		(document.activeElement as HTMLElement).blur();
	};

	return (
		<ReactSelect
			defaultValue={selectedOption}
			isOptionDisabled={(option) => !!option.disabled}
			onChange={handleChange}
			onMenuClose={handleMenuClose}
			options={optionsSelectApp}
			placeholder={placeholder}
			styles={selectStyles}
			value={selectedOption}
		/>
	);
};
