export interface ISelect {
	placeholder?: string;
	value?: ISelectOption | null;
	onChange?: (value: ISelectOption | null) => void;
	onBlur?: () => void;
}

export interface ISelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}
