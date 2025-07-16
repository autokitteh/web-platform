export interface ChatbotIframeProps {
	title?: string;
	width?: string | number;
	height?: string | number;
	className?: string;
	onConnect?: () => void;
	projectId?: string;
	configMode?: boolean;
	hideCloseButton?: boolean;
	hideHistoryButton?: boolean;
	showFullscreenToggle?: boolean;
	isFullscreen?: boolean;
	onToggleFullscreen?: (isFullscreen: boolean) => void;
}
