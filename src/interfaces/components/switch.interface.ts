export interface SwitchProps {
	className?: string;
	label?: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}
