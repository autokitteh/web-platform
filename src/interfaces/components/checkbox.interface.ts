export interface CheckboxProps {
	checked: boolean;
	label?: string;
	onChange: (checked: boolean) => void;
	title?: string;
	className?: string;
	isLoading: boolean;
	labelClassName?: string;
}
