import { Connection } from "@src/types/models";

export interface ConnectionStore {
	retries: number;
	connectionInProgress: boolean;
	incrementRetries: () => void;
	resetChecker: () => void;
	recheckIntervalIds: NodeJS.Timeout[];
	startCheckingStatus: (connectionId: string) => void;
	avoidNextRerenderCleanup: boolean;
	fetchConnectionsCallback: (() => void) | null;
	setFetchConnectionsCallback: (callback: (() => Promise<void | Connection[]>) | null) => void;
	setConnectionInProgress: (value: boolean) => void;
}
