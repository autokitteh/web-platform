import { SingleValue } from "react-select";

export interface SelectProps {
	dataTestid?: string;
	isError?: boolean;
	noOptionsLabel?: string;
	onBlur?: () => void;
	onChange: (value: SingleValue<SelectOption>) => void;
	options: SelectOption[];
	placeholder?: string;
	value?: SelectOption;
	variant?: "black" | "white";
}

export interface SelectOption {
	disabled?: boolean;
	label: string;
	value: string;
}
