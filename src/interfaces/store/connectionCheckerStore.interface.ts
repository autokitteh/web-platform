export interface ConnectionCheckerStore {
	connectionId: string;
	retries: number;
	incrementRetries: () => void;
	resetChecker: () => void;
	recheckIntervalId: NodeJS.Timeout | null;
	startCheckingStatus: (connectionId: string) => void;
}
