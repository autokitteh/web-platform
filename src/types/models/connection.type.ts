import { ConnectionStatus } from "@enums";

export type ConnectionStatusType = keyof typeof ConnectionStatus;

export type Connection = {
	connectionId: string;
	initUrl: string;
	integrationId?: string;
	integrationName?: string;
	integrationUniqueName?: string;
	logo?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	name: string;
	projectId: string;
	status: ConnectionStatusType;
	statusInfoMessage: string;
};
