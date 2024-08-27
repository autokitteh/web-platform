export interface ConnectionCheckerStore {
	retries: number;
	incrementRetries: () => void;
	resetChecker: () => void;
	recheckIntervalId: NodeJS.Timeout | null;
	startCheckingStatus: (connectionId: string) => void;
	shouldRefetchConnections: boolean;
	setShouldRefetchConnections: (value: boolean) => void;
	avoidNextRerenderCleanup: boolean;
}
