import { formColors } from "@constants/forms/formColors.constants";
import { SelectOption } from "@interfaces/components";
import { ColorSchemes } from "@type/theme.type";
import { StylesConfig, GroupBase } from "react-select";

const baseStyles = {
	"fontSize": "16px",
	"borderRadius": "8px",
	"boxShadow": "none",
	"cursor": "pointer",
	"transition": "all 0.25s",
	"padding": "6px 11px 6px 16px",

	"::-webkit-scrollbar": {
		width: "6px",
		height: "6px",
	},
	"::-webkit-scrollbar-thumb": {
		borderRadius: "10px",
	},
	"::-webkit-scrollbar-thumb:hover": {
		background: formColors["gray-400"],
	},
	"svg": {
		width: "24px",
		height: "24px",
	},
};

const getSelectStyles = (
	isError: boolean,
	colorScheme: ColorSchemes
): StylesConfig<SelectOption, false, GroupBase<SelectOption>> => {
	const defaultBorderColor = `0.5px solid ${isError ? formColors.error : formColors["gray-500"]}`;
	const greenBorderColor = `0.5px solid ${colorScheme === "dark" ? formColors["green-light"] : formColors["green-accent"]}`;
	const hoverBorderColor = colorScheme === "dark" ? formColors.white : formColors["gray-400"];
	const backgroundColor = formColors[colorScheme === "dark" ? "black" : "white"];
	const oppositeSchemeColor = formColors[colorScheme === "dark" ? "white" : "black"];
	const hoverBackgroundColor = formColors["gray-800"];
	const selectedBackgroundColor = colorScheme === "dark" ? formColors.white : formColors.black;
	const selectedTextColor = colorScheme === "dark" ? formColors.black : formColors.white;

	return {
		control: (provided, state) => ({
			...provided,
			...baseStyles,
			"border": defaultBorderColor,
			backgroundColor,
			"fontWeight": state.menuIsOpen ? 500 : 400,
			"color": oppositeSchemeColor,
			"borderBottomLeftRadius": state.menuIsOpen ? "0px" : undefined,
			"borderBottomRightRadius": state.menuIsOpen ? "0px" : undefined,
			"borderBottom": state.menuIsOpen ? "transparent" : defaultBorderColor,
			"borderTop": state.menuIsOpen ? greenBorderColor : defaultBorderColor,
			"borderLeft": state.menuIsOpen ? greenBorderColor : defaultBorderColor,
			"borderRight": state.menuIsOpen ? greenBorderColor : defaultBorderColor,
			"boxSizing": "border-box", // Ensure box-sizing is consistent
			"&:hover": {
				fontWeight: 500,
				borderColor: hoverBorderColor,
				borderBottom: state.menuIsOpen ? "transparent" : `0.5px solid ${hoverBorderColor}`,
				borderTop: state.menuIsOpen ? greenBorderColor : `0.5px solid ${hoverBorderColor}`,
				borderLeft: state.menuIsOpen ? greenBorderColor : `0.5px solid ${hoverBorderColor}`,
				borderRight: state.menuIsOpen ? greenBorderColor : `0.5px solid ${hoverBorderColor}`,
			},
			"&:after": {
				content: '""',
				position: "absolute",
				left: 0,
				right: 0,
				bottom: 0,
				width: "calc(100% - 27px)",
				margin: "auto",
				height: state.menuIsOpen ? "1px" : "0",
				backgroundColor: state.menuIsOpen && colorScheme === "dark" ? formColors["gray-500"] : "transparent",
				transition: "all 0.25s",
			},
		}),
		singleValue: (provided) => ({
			...provided,
			color: oppositeSchemeColor,
		}),
		menu: (provided) => ({
			...provided,
			backgroundColor,
			borderRadius: "8px",
			padding: "0px 7px 9px 0px",
			borderRight: greenBorderColor,
			borderLeft: greenBorderColor,
			borderBottom: greenBorderColor,
			borderTopRightRadius: "0px",
			borderTopLeftRadius: "0px",
			marginTop: "0px",
		}),
		menuList: (provided) => ({
			...provided,
			...baseStyles,
			paddingLeft: "7px",
		}),
		option: (provided, state) => ({
			...provided,
			"backgroundColor": state.isSelected ? selectedBackgroundColor : backgroundColor,
			"color": state.isSelected ? selectedTextColor : state.isDisabled ? formColors["gray-400"] : oppositeSchemeColor,
			"borderRadius": "8px",
			"marginTop": "4px",
			"cursor": state.isDisabled ? "not-allowed" : "pointer",
			"&:hover": !state.isDisabled && {
				backgroundColor: hoverBackgroundColor,
				color: formColors.white,
			},
		}),
		indicatorSeparator: () => ({
			display: "none",
		}),
		valueContainer: (provided) => ({
			...provided,
			padding: "0px",
		}),
		dropdownIndicator: (provided, state) => ({
			...provided,
			...baseStyles,
			"transform": state.selectProps.menuIsOpen ? "matrix(1,0,0,-1,0,0)" : "none",
			"color": oppositeSchemeColor,
			"&:hover": {
				color: oppositeSchemeColor,
			},
		}),
		input: (provided) => ({
			...provided,
			color: oppositeSchemeColor,
		}),
		placeholder: (provided, state) => ({
			...provided,
			color: state.isFocused ? "transparent" : oppositeSchemeColor,
		}),
	};
};

const getSelectDarkStyles = (isError: boolean): StylesConfig<SelectOption, false, GroupBase<SelectOption>> =>
	getSelectStyles(isError, "dark");

const getSelectLightStyles = (isError: boolean): StylesConfig<SelectOption, false, GroupBase<SelectOption>> =>
	getSelectStyles(isError, "light");

export { getSelectDarkStyles, getSelectLightStyles };
