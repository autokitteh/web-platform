export interface RadioButtonProps {
	id: string;
	name: string;
	value: string;
	checked: boolean;
	label: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	className?: string;
	disabled?: boolean;
}
