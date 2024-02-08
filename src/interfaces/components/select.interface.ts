import { SingleValue } from "react-select";

export interface ISelect {
	placeholder?: string;
	value?: ISelectOption | undefined;
	onChange?: (value: SingleValue<ISelectOption>) => void;
	onBlur?: () => void;
}

export interface ISelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}
