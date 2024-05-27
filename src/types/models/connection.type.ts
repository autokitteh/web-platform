type ConnectionStatus = {
	code: number;
	message: string;
};

export type Connection = {
	connectionId: string;
	name: string;
	initLink: string;
	integrationId?: string;
	integrationName?: string;
	status?: ConnectionStatus;
};
