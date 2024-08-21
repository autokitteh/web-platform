export interface ConnectionCheckerStore {
	setCheckerInterval: (connectionId: string) => void;
	connectionId: string;
	retries: number;
	incrementRetries: () => void;
	resetChecker: () => void;
	recheckIntervalId: NodeJS.Timeout | null;
	startCheckingStatus: () => void;
}
