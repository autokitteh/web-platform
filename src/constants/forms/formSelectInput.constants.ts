import { formColors } from "@constants/forms/formColors.constants";
import { SelectOption } from "@interfaces/components";
import { StylesConfig } from "react-select";

const getSelectBlackStyles = (isError: boolean): StylesConfig<SelectOption, false> => ({
	control: (provided, state) => ({
		...provided,
		"fontSize": 16,
		"padding": "9px 11px 9px 17px",
		"borderRadius": 8,
		"border": `0.5px solid ${isError ? formColors.error : formColors["gray-500"]}`,
		"backgroundColor": formColors.black,
		"boxShadow": "none",
		"fontWeight": state.isFocused ? 500 : 400,
		"cursor": "pointer",
		"color": "red",
		"&:hover": {
			fontWeight: 500,
			borderColor: formColors.white,
		},
	}),
	singleValue: (provided) => ({
		...provided,
		color: formColors.white,
	}),
	menu: (provided) => ({
		...provided,
		backgroundColor: formColors.black,
		borderRadius: 8,
		padding: "4px 10px 13px 10px",
		border: `0.5px solid ${formColors["gray-500"]}`,
	}),
	menuList: (provided) => ({
		...provided,
		"::-webkit-scrollbar": {
			width: 6,
			height: 6,
		},
		"::-webkit-scrollbar-thumb": {
			background: formColors["gray-300"],
			borderRadius: 10,
		},
		"::-webkit-scrollbar-thumb:hover": {
			background: formColors["gray-400"],
		},
	}),
	option: (provided, state) => ({
		...provided,
		"backgroundColor": state.isSelected ? formColors.white : formColors.black,
		"color": state.isSelected ? formColors.black : state.isDisabled ? formColors["gray-400"] : formColors.white,
		"borderRadius": 8,
		"transition": ".25s",
		"marginTop": 7,
		"fontSize": 16,
		"cursor": state.isDisabled ? "not-allowed" : "pointer",
		"&:hover": !state.isDisabled && {
			backgroundColor: formColors["gray-800"],
			color: formColors.white,
		},
	}),
	indicatorSeparator: () => ({
		display: "none",
	}),
	valueContainer: (provided) => ({
		...provided,
		padding: 0,
	}),
	dropdownIndicator: (provided, state) => ({
		...provided,
		"padding": 0,
		"transform": state.selectProps.menuIsOpen ? "matrix(1,0,0,-1,0,0)" : "none",
		"transition": ".25s",
		"color": formColors.white,
		"svg": {
			width: "24px",
			height: "24px",
		},
		"&:hover": {
			color: formColors.white,
		},
	}),
	input: (provided) => ({
		...provided,
		color: formColors.white,
	}),
	placeholder: (provided, state) => ({
		...provided,
		transition: ".25s",
		color: state.isFocused ? "transparent" : formColors.white,
	}),
});

const getSelectWhiteStyles = (isError: boolean): StylesConfig<SelectOption, false> => ({
	control: (provided, state) => ({
		...provided,
		"fontSize": 16,
		"padding": "9px 11px 9px 17px",
		"borderRadius": 8,
		"border": `0.5px solid ${isError ? formColors.error : formColors["gray-500"]}`,
		"backgroundColor": formColors.white,
		"boxShadow": "none",
		"fontWeight": state.isFocused ? 500 : 400,
		"cursor": "pointer",
		"color": formColors.black,
		"&:hover": {
			fontWeight: 500,
			borderColor: formColors["gray-400"],
		},
	}),
	singleValue: (provided) => ({
		...provided,
		color: formColors.black,
	}),
	menu: (provided) => ({
		...provided,
		backgroundColor: formColors.white,
		borderRadius: 8,
		padding: "4px 10px 13px 10px",
		border: `0.5px solid ${formColors["gray-500"]}`,
	}),
	menuList: (provided) => ({
		...provided,
		"::-webkit-scrollbar": {
			width: 6,
			height: 6,
		},
		"::-webkit-scrollbar-thumb": {
			background: formColors["gray-300"],
			borderRadius: 10,
		},
		"::-webkit-scrollbar-thumb:hover": {
			background: formColors["gray-400"],
		},
	}),
	option: (provided, state) => ({
		...provided,
		"backgroundColor": state.isSelected ? formColors.black : formColors.white,
		"color": state.isSelected ? formColors.white : formColors.black,
		"borderRadius": 8,
		"transition": ".25s",
		"marginTop": 7,
		"fontSize": 16,
		"cursor": state.isDisabled ? "not-allowed" : "pointer",
		"&:hover": {
			backgroundColor: formColors["gray-800"],
			color: formColors.white,
		},
	}),
	indicatorSeparator: () => ({
		display: "none",
	}),
	valueContainer: (provided) => ({
		...provided,
		padding: 0,
	}),
	dropdownIndicator: (provided, state) => ({
		...provided,
		"padding": 0,
		"transform": state.selectProps.menuIsOpen ? "matrix(1,0,0,-1,0,0)" : "none",
		"transition": ".25s",
		"color": formColors.black,
		"svg": {
			width: "24px",
			height: "24px",
		},
		"&:hover": {
			color: formColors.white,
		},
	}),
	input: (provided) => ({
		...provided,
		color: formColors.black,
	}),
	placeholder: (provided, state) => ({
		...provided,
		transition: ".25s",
		color: state.isFocused ? "transparent" : formColors.black,
	}),
});

export { getSelectBlackStyles, getSelectWhiteStyles };
