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
<<<<<<< HEAD
	isCancelButtonHidden?: boolean;
=======
	hideBackButton?: boolean;
	hideXbutton?: boolean;
>>>>>>> 9ce7490f (feat: global connections per organization)
}
