import { ISelectOption } from "@interfaces/components";
import { StylesConfig } from "react-select";

export const selectStyles: StylesConfig<ISelectOption, false> = {
	control: (provided, state) => ({
		...provided,
		"fontSize": 16,
		"padding": "9px 11px 9px 17px",
		"borderRadius": 8,
		"border": "0.5px solid #535353",
		"backgroundColor": "#000",
		"boxShadow": "none",
		"fontWeight": state.isFocused ? 500 : 400,
		"cursor": "pointer",
		"color": "red",
		"&:hover": {
			fontWeight: 500,
			borderColor: "#fff",
		},
	}),
	singleValue: (provided) => ({
		...provided,
		color: "#fff",
	}),
	menu: (provided) => ({
		...provided,
		backgroundColor: "#000",
		borderRadius: 8,
		padding: "4px 10px 13px 10px",
		border: "0.5px solid #535353",
	}),
	menuList: (provided) => ({
		...provided,
		"::-webkit-scrollbar": {
			width: 6,
			height: 6,
		},
		"::-webkit-scrollbar-thumb": {
			background: "#D2D2D7",
			borderRadius: 10,
		},
		"::-webkit-scrollbar-thumb:hover": {
			background: "#818181",
		},
	}),
	option: (provided, state) => ({
		...provided,
		"backgroundColor": state.isSelected ? "#fff" : "#000",
		"color": state.isSelected ? "#000" : state.isDisabled ? "#818181" : "#fff",
		"borderRadius": 8,
		"transition": ".25s",
		"marginTop": 7,
		"fontSize": 16,
		"cursor": state.isDisabled ? "not-allowed" : "pointer",
		"&:hover": !state.isDisabled && {
			backgroundColor: "#1B1B1B",
			color: "#fff",
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
		"color": "#fff",
		"svg": {
			width: "24px",
			height: "24px",
		},
		"&:hover": {
			color: "#fff",
		},
	}),
	input: (provided) => ({
		...provided,
		color: "#fff",
	}),
	placeholder: (provided, state) => ({
		...provided,
		transition: ".25s",
		color: state.isFocused ? "transparent" : "#fff",
	}),
};
