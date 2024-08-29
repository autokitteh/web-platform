export interface ConnectionCheckerStore {
	retries: number;
	incrementRetries: () => void;
	resetChecker: () => void;
	recheckIntervalId: NodeJS.Timeout | null;
	startCheckingStatus: (connectionId: string) => void;
	avoidNextRerenderCleanup: boolean;
	fetchConnectionsCallback: (() => void) | null;
	setFetchConnectionsCallback: (callback: (() => Promise<void>) | null) => void;
}
