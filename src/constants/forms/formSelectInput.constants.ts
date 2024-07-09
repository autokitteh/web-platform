import { GroupBase, StylesConfig } from "react-select";

import { formColors } from "@constants/forms/formColors.constants";
import { SelectOption } from "@interfaces/components";
import { ColorSchemes } from "@type/theme.type";

const baseStyles = {
	"::-webkit-scrollbar": {
		height: "6px",
		width: "6px",
	},
	"::-webkit-scrollbar-thumb": {
		borderRadius: "10px",
	},
	"::-webkit-scrollbar-thumb:hover": {
		background: formColors["gray-400"],
	},
	"borderRadius": "8px",
	"boxShadow": "none",

	"cursor": "pointer",
	"fontSize": "16px",
	"padding": "6px 11px 6px 16px",
	"svg": {
		height: "24px",
		width: "24px",
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

			"&:after": {
				backgroundColor: state.menuIsOpen && colorScheme === "dark" ? formColors["gray-500"] : "transparent",
				bottom: 0,
				content: '""',
				height: state.menuIsOpen ? "1px" : "0",
				left: 0,
				margin: "auto",
				position: "absolute",
				right: 0,
				transition: "all 0.25s",
				width: "calc(100% - 27px)",
			},

			// Ensure box-sizing is consistent

			"&:hover": {
				borderBottom: state.menuIsOpen ? "transparent" : `0.5px solid ${hoverBorderColor}`,
				borderColor: hoverBorderColor,
				borderLeft: state.menuIsOpen ? greenBorderColor : `0.5px solid ${hoverBorderColor}`,
				borderRight: state.menuIsOpen ? greenBorderColor : `0.5px solid ${hoverBorderColor}`,
				borderTop: state.menuIsOpen ? greenBorderColor : `0.5px solid ${hoverBorderColor}`,
				fontWeight: 500,
			},

			backgroundColor,

			"border": defaultBorderColor,

			"borderBottom": state.menuIsOpen ? "transparent" : defaultBorderColor,

			"borderBottomLeftRadius": state.menuIsOpen ? "0px" : undefined,

			"borderBottomRightRadius": state.menuIsOpen ? "0px" : undefined,

			"borderLeft": state.menuIsOpen ? greenBorderColor : defaultBorderColor,

			"borderRight": state.menuIsOpen ? greenBorderColor : defaultBorderColor,

			"borderTop": state.menuIsOpen ? greenBorderColor : defaultBorderColor,

			"boxSizing": "border-box",
			"color": oppositeSchemeColor,
			"fontWeight": state.menuIsOpen ? 500 : 400,
		}),
		dropdownIndicator: (provided, state) => ({
			...provided,
			...baseStyles,
			"&:hover": {
				color: oppositeSchemeColor,
			},
			"color": oppositeSchemeColor,
			"transform": state.selectProps.menuIsOpen ? "matrix(1,0,0,-1,0,0)" : "none",
		}),
		indicatorSeparator: () => ({
			display: "none",
		}),
		input: (provided) => ({
			...provided,
			color: oppositeSchemeColor,
		}),
		menu: (provided) => ({
			...provided,
			backgroundColor,
			borderBottom: greenBorderColor,
			borderLeft: greenBorderColor,
			borderRadius: "8px",
			borderRight: greenBorderColor,
			borderTopLeftRadius: "0px",
			borderTopRightRadius: "0px",
			marginTop: "0px",
			padding: "0px 7px 9px 0px",
		}),
		menuList: (provided) => ({
			...provided,
			...baseStyles,
			paddingLeft: "7px",
		}),
		option: (provided, state) => ({
			...provided,
			"&:hover": !state.isDisabled && {
				backgroundColor: hoverBackgroundColor,
				color: formColors.white,
			},
			"backgroundColor": state.isSelected ? selectedBackgroundColor : backgroundColor,
			"borderRadius": "8px",
			"color": state.isSelected
				? selectedTextColor
				: state.isDisabled
					? formColors["gray-400"]
					: oppositeSchemeColor,
			"cursor": state.isDisabled ? "not-allowed" : "pointer",
			"marginTop": "4px",
		}),
		placeholder: (provided, state) => ({
			...provided,
			color: state.isFocused ? "transparent" : oppositeSchemeColor,
		}),
		singleValue: (provided) => ({
			...provided,
			color: oppositeSchemeColor,
		}),
		valueContainer: (provided) => ({
			...provided,
			padding: "0px",
		}),
	};
};

const getSelectDarkStyles = (isError: boolean): StylesConfig<SelectOption, false, GroupBase<SelectOption>> =>
	getSelectStyles(isError, "dark");

const getSelectLightStyles = (isError: boolean): StylesConfig<SelectOption, false, GroupBase<SelectOption>> =>
	getSelectStyles(isError, "light");

export { getSelectDarkStyles, getSelectLightStyles };
