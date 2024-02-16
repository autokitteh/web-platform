import { SingleValue } from "react-select";

export interface ISelect {
	placeholder?: string;
	value?: ISelectOption | undefined;
	options: ISelectOption[];
	isError?: boolean;
	onChange: (value: SingleValue<ISelectOption>[]) => void;
	onBlur?: () => void;
}

export interface ISelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface ISelectAppChangeForm {
	name: string;
	value: string;
}
