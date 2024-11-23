import { Connection } from "@src/types/models";

export interface ConnectionCheckerStore {
	retries: number;
	incrementRetries: () => void;
	resetChecker: () => void;
	recheckIntervalIds: NodeJS.Timeout[] | null;
	startCheckingStatus: (connectionId: string) => void;
	avoidNextRerenderCleanup: boolean;
	fetchConnectionsCallback: (() => void) | null;
	setFetchConnectionsCallback: (callback: (() => Promise<void | Connection[]>) | null) => void;
}
