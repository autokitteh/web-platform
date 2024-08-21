export interface ConnectionCheckerStore {
	setCheckerInterval: (connectionId: string) => void;
	connectionId: string;
	retries: number;
	incrementRetries: () => void;
	resetChecker: () => void;
}
