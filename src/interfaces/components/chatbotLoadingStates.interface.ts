export interface ChatbotLoadingStatesProps {
	isLoading: boolean;
	loadError: string | null | boolean;
	onRetry: () => void;
	onBack?: () => void;
}
