import { ColorSchemes } from "@types/theme.type";
import { GroupBase, StylesConfig } from "react-select";

import { formThemes } from "@constants/forms/formThemes.constants";
import { SelectOption } from "@interfaces/components";

const baseStyles = {
	"::-webkit-scrollbar": {
		height: "6px",
		width: "6px",
	},
	"::-webkit-scrollbar-thumb": {
		borderRadius: "10px",
		background: formThemes["gray-750"],
	},
	"::-webkit-scrollbar-thumb:hover": {
		background: formThemes["gray-950"],
	},
	borderRadius: "8px",
	boxShadow: "none",

	cursor: "pointer",
	fontSize: "16px",
	padding: "6px 11px 6px 16px",
	svg: {
		height: "24px",
		width: "24px",
	},
};

const getSelectStyles = (
	isError: boolean,
	colorScheme: ColorSchemes,
	isDisable: boolean
): StylesConfig<SelectOption, false, GroupBase<SelectOption>> => {
	const defaultBorderColor = `0.5px solid ${isError ? formThemes.error : formThemes["gray-950"]}`;
	const greenBorderColor = `0.5px solid ${colorScheme === "dark" ? formThemes["green-200"] : formThemes["green-800"]}`;
	const hoverBorderColor = colorScheme === "dark" ? formThemes.light : formThemes["gray-750"];
	const backgroundColor = formThemes[colorScheme === "dark" ? "dark" : "light"];
	const oppositeSchemeColor = isDisable
		? formThemes["gray-750"]
		: colorScheme === "dark"
			? formThemes["light"]
			: formThemes["dark"];
	const hoverBackgroundColor = formThemes["gray-1250"];
	const selectedBackgroundColor = colorScheme === "dark" ? formThemes.light : formThemes.dark;
	const selectedTextColor = colorScheme === "dark" ? formThemes.dark : formThemes.light;

	return {
		control: (provided, state) => ({
			...provided,
			...baseStyles,
			"&:after": {
				backgroundColor: state.menuIsOpen && colorScheme === "dark" ? formThemes["gray-950"] : "transparent",
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

			border: defaultBorderColor,

			borderBottom: state.menuIsOpen ? "transparent" : defaultBorderColor,

			borderBottomLeftRadius: state.menuIsOpen ? "0px" : undefined,

			borderBottomRightRadius: state.menuIsOpen ? "0px" : undefined,

			borderLeft: state.menuIsOpen ? greenBorderColor : defaultBorderColor,

			borderRight: state.menuIsOpen ? greenBorderColor : defaultBorderColor,

			borderTop: state.menuIsOpen ? greenBorderColor : defaultBorderColor,

			boxSizing: "border-box",
			color: oppositeSchemeColor,
			fontWeight: state.menuIsOpen ? 500 : 400,
		}),
		dropdownIndicator: (provided, state) => ({
			...provided,
			...baseStyles,
			"&:hover": {
				color: oppositeSchemeColor,
			},
			color: oppositeSchemeColor,
			transform: state.selectProps.menuIsOpen ? "matrix(1,0,0,-1,0,0)" : "none",
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
			zIndex: 20,
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
				color: formThemes.light,
			},
			backgroundColor: state.isSelected ? selectedBackgroundColor : backgroundColor,
			borderRadius: "8px",
			color: state.isSelected
				? selectedTextColor
				: state.isDisabled
					? formThemes["gray-750"]
					: oppositeSchemeColor,
			cursor: state.isDisabled ? "not-allowed" : "pointer",
			marginTop: "4px",
		}),
		placeholder: (provided, state) => ({
			...provided,
			color: state.isFocused ? "transparent" : formThemes["gray-600"],
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

const getSelectDarkStyles = (
	isError: boolean,
	isDisable: boolean
): StylesConfig<SelectOption, false, GroupBase<SelectOption>> => getSelectStyles(isError, "dark", isDisable);

const getSelectLightStyles = (
	isError: boolean,
	isDisable: boolean
): StylesConfig<SelectOption, false, GroupBase<SelectOption>> => getSelectStyles(isError, "light", isDisable);

export { getSelectDarkStyles, getSelectLightStyles };

export const emptySelectItem = { label: "", value: "" };
