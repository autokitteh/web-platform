export interface ChatbotIframeProps {
	title?: string;
	width?: string | number;
	height?: string | number;
	className?: string;
	onConnect?: () => void;
	projectId?: string;
	configMode: boolean;
	hideCloseButton?: boolean;
	displayDeployButton?: boolean;
	onBack?: () => void;
	displayResizeButton?: boolean;
	padded?: boolean;
	isTransparent?: boolean;
}
