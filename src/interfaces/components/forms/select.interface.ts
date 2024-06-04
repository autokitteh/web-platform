import { SingleValue } from "react-select";

export interface SelectProps {
	placeholder?: string;
	value?: SelectOption;
	options: SelectOption[];
	variant?: "black" | "white";
	isError?: boolean;
	onChange: (value: SingleValue<SelectOption>) => void;
	onBlur?: () => void;
}

export interface SelectOption<T = string> {
	value: T;
	label: string;
	disabled?: boolean;
}
