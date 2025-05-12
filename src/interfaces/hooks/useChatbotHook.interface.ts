export interface IframeState {
	isLoading: boolean;
	loadError: string | null;
	isIframeLoaded: boolean;
}

export interface IframeError {
	message: string;
	error: string;
}
