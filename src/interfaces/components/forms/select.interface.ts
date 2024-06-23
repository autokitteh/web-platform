import { SingleValue } from "react-select";

export interface SelectProps {
	placeholder?: string;
	value?: SelectOption;
	options: SelectOption[];
	variant?: "black" | "white";
	isError?: boolean;
	onChange: (value: SingleValue<SelectOption>) => void;
	onBlur?: () => void;
	ref?: null;
	noOptionsLabel?: string;
}

export interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}
