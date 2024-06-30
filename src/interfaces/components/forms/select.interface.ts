import { SingleValue } from "react-select";

export interface SelectProps {
	placeholder?: string;
	value?: SelectOption;
	options: SelectOption[];
	variant?: ColorScheme;
	isError?: boolean;
	noOptionsLabel?: string;
	dataTestid?: string;
	onChange: (value: SingleValue<SelectOption>) => void;
	onBlur?: () => void;
}

export type ColorScheme = "black" | "white";

export interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}
