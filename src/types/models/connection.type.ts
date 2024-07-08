import { ConnectionStatus } from "@enums";

export type ConnectionStatusType = keyof typeof ConnectionStatus;

export type Connection = {
	connectionId: string;
	initUrl: string;
	integrationId?: string;
	integrationName?: string;
	name: string;
	status: ConnectionStatusType;
	statusInfoMessage: string;
};
