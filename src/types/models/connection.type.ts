import { ConnectionStatus } from "@enums";

export type ConnectionStatusType = keyof typeof ConnectionStatus;

export type Connection = {
	connectionId: string;
	name: string;
	initUrl: string;
	integrationId?: string;
	integrationName?: string;
	status: ConnectionStatusType;
	statusInfoMessage: string;
};
