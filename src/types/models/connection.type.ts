import { ConnectionStatus } from "@enums/components/connectionStatus.enum";

export type ConnectionStatusType = keyof typeof ConnectionStatus;

export type Connection = {
	connectionId: string;
	integrationId?: string;
	integrationName?: string;
	integrationUniqueName?: string;
	logo?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	name: string;
	orgId?: string;
	projectId: string;
	status: ConnectionStatusType;
	statusInfoMessage: string;
};
