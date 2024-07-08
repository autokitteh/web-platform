import { SingleValue } from "react-select";

import { ColorSchemes } from "@type";

export interface SelectProps {
	placeholder?: string;
	value?: SelectOption;
	options: SelectOption[];
	variant?: ColorSchemes;
	isError?: boolean;
	noOptionsLabel?: string;
	dataTestid?: string;
	onChange: (value: SingleValue<SelectOption>) => void;
	onBlur?: () => void;
}

export interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}
