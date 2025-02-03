import { SingleValue } from "react-select";

import { ColorSchemes } from "@type";

export interface SelectProps {
	dataTestid?: string;
	isError?: boolean;
	noOptionsLabel?: string;
	label?: string;
	onBlur?: () => void;
	onChange?: (value: SingleValue<SelectOption>) => void;
	onCreateOption?: (value: string) => void;
	options: SelectOption[];
	placeholder?: string;
	value?: SelectOption | null;
	defaultValue?: SelectOption | null;
	variant?: ColorSchemes;
	disabled?: boolean;
	createLabel?: string;
}

export interface SelectOption {
	disabled?: boolean;
	hidden?: boolean;
	label: string;
	value: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}
export interface IntegrationSelectOption extends SelectOption {
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface SelectIconLabel {
	label: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}
