import React, { useState, useEffect } from "react";
import { getSelectBlackStyles, getSelectWhiteStyles } from "@constants";
import { SelectProps, SelectOption } from "@interfaces/components";
import { useTranslation } from "react-i18next";
import ReactSelect, { GroupBase, OptionProps, SingleValue, components } from "react-select";

type IconOptionProps = OptionProps<SelectOption, false, GroupBase<SelectOption>>;

const { Option } = components;
const IconOption: React.FC<IconOptionProps> = ({ data, ...props }) => {
	const { icon: Icon, label } = data;
	return (
		<Option {...props} data={data}>
			<div className="flex flex-row h-4">
				<div className="flex">{Icon ? <Icon style={{ width: 24, height: 24, marginRight: 10 }} /> : null}</div>
				<div className="flex">{label}</div>
			</div>
		</Option>
	);
};

export const Select = ({
	placeholder = "Select",
	value,
	options,
	isError = false,
	variant,
	onChange,
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
			components={{ Option: IconOption }}
			isOptionDisabled={(option) => !!option.disabled}
			noOptionsMessage={() => noOptionsMessage}
			onChange={handleChange}
			onMenuClose={handleMenuClose}
			options={options}
			placeholder={placeholder}
			styles={selectStyles}
			value={selectedOption}
		/>
	);
};
