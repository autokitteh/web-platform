import { TourId } from "@src/enums";
import { Connection } from "@src/types/models";

export interface ConnectionStore {
	retries: Record<string, number>;
	connectionInProgress: boolean;
	isLoadingFromChatbot: boolean;
	editingConnectionId: string | undefined;
	incrementRetries: (connectionId: string) => void;
	resetChecker: (connectionId?: string, force?: boolean) => void;
	connectionIntervals: Record<string, NodeJS.Timeout>;
	connectionTimeouts: Record<string, NodeJS.Timeout>;
	startCheckingStatus: (connectionId: string) => void;
	stopCheckingStatus: (connectionId: string) => void;
	avoidNextRerenderCleanup: boolean;
	fetchConnectionsCallback: (() => void) | null;
	setFetchConnectionsCallback: (callback: (() => Promise<void | Connection[]>) | null) => void;
	setConnectionInProgress: (value: boolean) => void;
	setIsLoadingFromChatbot: (value: boolean) => void;
	setEditingConnectionId: (connectionId: string | undefined) => void;
	tourStepAdvanced: TourId[];
}
