export interface TabFormHeaderProps {
	className?: string;
	form?: string;
	isLoading?: boolean;
	title: string;
	isHiddenButtons?: boolean;
	customBackRoute?: string;
	onBack?: () => void;
	onCancel?: () => void;
	isSaveButtonHidden?: boolean;
}
