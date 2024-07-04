import { formColors } from "@constants/forms/formColors.constants";
import { SelectOption } from "@interfaces/components";
import { StylesConfig } from "react-select";

const getSelectBlackStyles = (isError: boolean): StylesConfig<SelectOption, false> => ({
	control: (provided, state) => ({
		...provided,
		"&:hover": {
			borderColor: formColors.white,
			fontWeight: 500,
		},
		"backgroundColor": formColors.black,
		"border": `0.5px solid ${isError ? formColors.error : formColors["gray-500"]}`,
		"borderRadius": 8,
		"boxShadow": "none",
		"color": "red",
		"cursor": "pointer",
		"fontSize": 16,
		"fontWeight": state.isFocused ? 500 : 400,
		"padding": "9px 11px 9px 17px",
	}),
	dropdownIndicator: (provided, state) => ({
		...provided,
		"&:hover": {
			color: formColors.white,
		},
		"color": formColors.white,
		"padding": 0,
		"svg": {
			height: "24px",
			width: "24px",
		},
		"transform": state.selectProps.menuIsOpen ? "matrix(1,0,0,-1,0,0)" : "none",
		"transition": ".25s",
	}),
	indicatorSeparator: () => ({
		display: "none",
	}),
	input: (provided) => ({
		...provided,
		color: formColors.white,
	}),
	menu: (provided) => ({
		...provided,
		backgroundColor: formColors.black,
		border: `0.5px solid ${formColors["gray-500"]}`,
		borderRadius: 8,
		padding: "4px 10px 13px 10px",
	}),
	menuList: (provided) => ({
		...provided,
		"::-webkit-scrollbar": {
			height: 6,
			width: 6,
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
		"&:hover": !state.isDisabled && {
			backgroundColor: formColors["gray-800"],
			color: formColors.white,
		},
		"backgroundColor": state.isSelected ? formColors.white : formColors.black,
		"borderRadius": 8,
		"color": state.isSelected ? formColors.black : state.isDisabled ? formColors["gray-400"] : formColors.white,
		"cursor": state.isDisabled ? "not-allowed" : "pointer",
		"fontSize": 16,
		"marginTop": 7,
		"transition": ".25s",
	}),
	placeholder: (provided, state) => ({
		...provided,
		color: state.isFocused ? "transparent" : formColors.white,
		transition: ".25s",
	}),
	singleValue: (provided) => ({
		...provided,
		color: formColors.white,
	}),
	valueContainer: (provided) => ({
		...provided,
		padding: 0,
	}),
});

const getSelectWhiteStyles = (isError: boolean): StylesConfig<SelectOption, false> => ({
	control: (provided, state) => ({
		...provided,
		"&:hover": {
			borderColor: formColors["gray-400"],
			fontWeight: 500,
		},
		"backgroundColor": formColors.white,
		"border": `0.5px solid ${isError ? formColors.error : formColors["gray-500"]}`,
		"borderRadius": 8,
		"boxShadow": "none",
		"color": formColors.black,
		"cursor": "pointer",
		"fontSize": 16,
		"fontWeight": state.isFocused ? 500 : 400,
		"padding": "9px 11px 9px 17px",
	}),
	dropdownIndicator: (provided, state) => ({
		...provided,
		"&:hover": {
			color: formColors.white,
		},
		"color": formColors.black,
		"padding": 0,
		"svg": {
			height: "24px",
			width: "24px",
		},
		"transform": state.selectProps.menuIsOpen ? "matrix(1,0,0,-1,0,0)" : "none",
		"transition": ".25s",
	}),
	indicatorSeparator: () => ({
		display: "none",
	}),
	input: (provided) => ({
		...provided,
		color: formColors.black,
	}),
	menu: (provided) => ({
		...provided,
		backgroundColor: formColors.white,
		border: `0.5px solid ${formColors["gray-500"]}`,
		borderRadius: 8,
		padding: "4px 10px 13px 10px",
	}),
	menuList: (provided) => ({
		...provided,
		"::-webkit-scrollbar": {
			height: 6,
			width: 6,
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
		"&:hover": {
			backgroundColor: formColors["gray-800"],
			color: formColors.white,
		},
		"backgroundColor": state.isSelected ? formColors.black : formColors.white,
		"borderRadius": 8,
		"color": state.isSelected ? formColors.white : formColors.black,
		"cursor": state.isDisabled ? "not-allowed" : "pointer",
		"fontSize": 16,
		"marginTop": 7,
		"transition": ".25s",
	}),
	placeholder: (provided, state) => ({
		...provided,
		color: state.isFocused ? "transparent" : formColors.black,
		transition: ".25s",
	}),
	singleValue: (provided) => ({
		...provided,
		color: formColors.black,
	}),
	valueContainer: (provided) => ({
		...provided,
		padding: 0,
	}),
});

export { getSelectBlackStyles, getSelectWhiteStyles };
