import { formColors } from "@constants/forms/formColors.constants";
import { SelectOption } from "@interfaces/components";
import { StylesConfig } from "react-select";

const getSelectBlackStyles = (isError: boolean): StylesConfig<SelectOption, false> => {
	const defaultBorderColor = `0.5px solid ${isError ? formColors.error : formColors["gray-500"]}`;
	const greenBorderColor = `0.5px solid ${formColors["green-light"]}`;
	const whiteBorderColor = `0.5px solid ${formColors.white}`;

	return {
		control: (provided, state) => ({
			...provided,
			"fontSize": 16,
			"padding": "9px 11px 9px 17px",
			"borderRadius": 8,
			"border": defaultBorderColor,
			"backgroundColor": formColors.black,
			"boxShadow": "none",
			"fontWeight": state.menuIsOpen ? 500 : 400,
			"cursor": "pointer",
			"color": "red",
			"borderBottomLeftRadius": state.menuIsOpen ? 0 : undefined,
			"borderBottomRightRadius": state.menuIsOpen ? 0 : undefined,
			"borderBottom": state.menuIsOpen ? "transparent" : defaultBorderColor,
			"borderTop": state.menuIsOpen ? greenBorderColor : defaultBorderColor,
			"borderLeft": state.menuIsOpen ? greenBorderColor : defaultBorderColor,
			"borderRight": state.menuIsOpen ? greenBorderColor : defaultBorderColor,
			"&:hover": {
				fontWeight: 500,
				borderColor: formColors.white,
				borderBottom: state.menuIsOpen ? "transparent" : whiteBorderColor,
				borderTop: state.menuIsOpen ? greenBorderColor : whiteBorderColor,
				borderLeft: state.menuIsOpen ? greenBorderColor : whiteBorderColor,
				borderRight: state.menuIsOpen ? greenBorderColor : whiteBorderColor,
			},
			"&:after": {
				content: '""',
				position: "absolute",
				left: 0,
				right: 0,
				bottom: 0,
				width: "94%",
				margin: "auto",
				height: state.menuIsOpen ? "1px" : "0",
				backgroundColor: state.menuIsOpen ? formColors["gray-500"] : "transparent",
				transition: "all 0.25s",
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
			boxShadow: "none",
			padding: "4px 10px 13px 10px",
			borderRight: greenBorderColor,
			borderLeft: greenBorderColor,
			borderBottom: greenBorderColor,
			borderTopRightRadius: 0,
			borderTopLeftRadius: 0,
			marginTop: "0",
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
			"marginRight": "0.4vw",
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
	};
};

const getSelectWhiteStyles = (isError: boolean): StylesConfig<SelectOption, false> => {
	const defaultBorderColor = `0.5px solid ${isError ? formColors.error : formColors["gray-500"]}`;
	const greenBorderColor = `0.5px solid ${formColors["green-accent"]}`;
	const grayBorderColor = `0.5px solid ${formColors["gray-500"]}`;

	return {
		control: (provided, state) => ({
			...provided,
			"fontSize": 16,
			"padding": "9px 11px 9px 17px",
			"borderRadius": 8,
			"border": defaultBorderColor,
			"backgroundColor": formColors.white,
			"boxShadow": "none",
			"fontWeight": state.isFocused ? 500 : 400,
			"cursor": "pointer",
			"color": formColors.black,
			"borderBottomLeftRadius": state.menuIsOpen ? 0 : undefined,
			"borderBottomRightRadius": state.menuIsOpen ? 0 : undefined,
			"borderBottom": state.menuIsOpen ? "transparent" : defaultBorderColor,
			"borderTop": state.menuIsOpen ? greenBorderColor : defaultBorderColor,
			"borderLeft": state.menuIsOpen ? greenBorderColor : defaultBorderColor,
			"borderRight": state.menuIsOpen ? greenBorderColor : defaultBorderColor,
			"&:hover": {
				fontWeight: 500,
				borderColor: formColors["gray-400"],
				borderBottom: state.menuIsOpen ? "transparent" : grayBorderColor,
				borderTop: state.menuIsOpen ? greenBorderColor : grayBorderColor,
				borderLeft: state.menuIsOpen ? greenBorderColor : grayBorderColor,
				borderRight: state.menuIsOpen ? greenBorderColor : grayBorderColor,
			},
			"&:after": {
				content: '""',
				position: "absolute",
				left: 0,
				right: 0,
				bottom: 0,
				width: "94%",
				margin: "auto",
				height: state.menuIsOpen ? "1px" : "0",
				backgroundColor: state.menuIsOpen ? formColors["gray-300"] : "transparent",
				transition: "all 0.25s",
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
			boxShadow: "none",
			padding: "4px 10px 13px 10px",
			marginTop: "0",
			border: greenBorderColor,
			borderRight: greenBorderColor,
			borderLeft: greenBorderColor,
			borderBottom: greenBorderColor,
			borderTop: 0,
			borderTopRightRadius: 0,
			borderTopLeftRadius: 0,
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
	};
};

export { getSelectBlackStyles, getSelectWhiteStyles };
