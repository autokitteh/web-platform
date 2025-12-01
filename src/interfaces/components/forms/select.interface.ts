import { SingleValue } from "react-select";

import { ConnectionStatus } from "@src/enums";
import { ColorSchemes } from "@type";

export interface SelectProps {
	dataTestid?: string;
	hint?: string;
	isError?: boolean;
	isRequired?: boolean;
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
export interface BaseSelectOption {
	label: string;
	value: string;
}

export interface SelectOptionStatus {
	status?: ConnectionStatus;
	statusInfoMessage?: string;
}

export interface SelectOption extends BaseSelectOption {
	disabled?: boolean;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	isHighlighted?: boolean;
	highlightLabel?: string;
	connectionStatus?: SelectOptionStatus;
}

export interface PartialSelectOption {
	disabled?: boolean;
	label?: string;
	value?: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface IntegrationSelectOption extends SelectOption {
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface SelectIconLabel {
	label: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	"aria-hidden"?: boolean;
	isHighlighted?: boolean;
	highlightLabel?: string;
	indicator?: React.ReactNode;
}

export interface SelectConnectionIconLabel extends SelectIconLabel {
	connectionStatus?: SelectOptionStatus;
}
