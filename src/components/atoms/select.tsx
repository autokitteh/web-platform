import React, { useState, useEffect } from "react";
import { getSelectStyles } from "@constants";
import { ISelect, ISelectOption } from "@interfaces/components";
import ReactSelect, { SingleValue } from "react-select";

export const Select = ({ placeholder = "Select", value, options, isError = false, onChange, ...rest }: ISelect) => {
	const [selectedOption, setSelectedOption] = useState<SingleValue<ISelectOption>>();

	useEffect(() => {
		setSelectedOption(options.find((option) => option.value === value?.value));
	}, [value, options]);

	const handleChange = (selected: SingleValue<ISelectOption>) => {
		setSelectedOption(selected);
		onChange?.([selected]);
	};

	const handleMenuClose = () => {
		(document.activeElement as HTMLElement).blur();
	};

	return (
		<ReactSelect
			{...rest}
			defaultValue={selectedOption}
			isOptionDisabled={(option) => !!option.disabled}
			onChange={handleChange}
			onMenuClose={handleMenuClose}
			options={options}
			placeholder={placeholder}
			styles={getSelectStyles(isError)}
			value={selectedOption}
		/>
	);
};
