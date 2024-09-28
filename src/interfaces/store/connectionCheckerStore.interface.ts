import { Connection } from "@src/types/models";

export interface ConnectionCheckerStore {
	retries: number;
	incrementRetries: () => void;
	resetChecker: () => void;
	recheckIntervalId: NodeJS.Timeout | null;
	startCheckingStatus: (connectionId: string) => void;
	avoidNextRerenderCleanup: boolean;
	fetchConnectionsCallback: (() => Promise<void | Connection[]>) | null;
	setFetchConnectionsCallback: (callback: (() => Promise<void | Connection[]>) | null) => void;
}
