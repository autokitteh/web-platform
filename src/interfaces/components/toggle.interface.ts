export interface ToggleProps {
	checked: boolean;
	title?: string;
	label?: string;
	onChange: (checked: boolean) => void;
}
