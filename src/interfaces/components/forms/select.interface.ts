import { SingleValue } from "react-select";

import { ColorSchemes } from "@type";

export interface SelectProps {
	dataTestid?: string;
	isError?: boolean;
	noOptionsLabel?: string;
	onBlur?: () => void;
	onChange: (value: SingleValue<SelectOption>) => void;
	options: SelectOption[];
	placeholder?: string;
	value?: SelectOption;
	variant?: ColorSchemes;
	disabled?: boolean;
}

export interface SelectOption {
	disabled?: boolean;
	label: string;
	value: string;
}
