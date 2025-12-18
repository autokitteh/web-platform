// This file exists to avoid importing frontend code (like svg icons) into the playwright tests.

import { ConnectionStatus } from "@enums/components/connectionStatus.enum";
import { BaseSelectOption } from "@src/interfaces/components/forms/selectBase.interface";
import { Connection } from "@src/types/models/connection.type";

export const baseTriggerTypes: BaseSelectOption[] = [
	{
		label: "Scheduler",
		ariaLabel: "Scheduler Trigger",
		value: "schedule",
	},
	{
		label: "Webhook",
		ariaLabel: "Webhook Trigger",
		value: "webhook",
	},
];

export const getConnectionStatus = (
	status: string,
	statusInfoMessage: string
): { status: ConnectionStatus; statusInfoMessage?: string } => {
	const statusValue = ConnectionStatus[status as keyof typeof ConnectionStatus];
	if (statusValue === ConnectionStatus.ok) return { status: ConnectionStatus.ok };
	if (statusValue === ConnectionStatus.warning) return { status: ConnectionStatus.warning, statusInfoMessage };

	return { status: ConnectionStatus.error, statusInfoMessage };
};

export interface ConnectionGroup {
	label: string;
	options: Array<{
		ariaLabel?: string;
		connectionStatus?: { status: ConnectionStatus; statusInfoMessage?: string };
		icon?: any;
		label: string;
		value: string;
	}>;
	hideHeader?: boolean;
}

export const buildBaseConnectionGroups = (
	connections: Connection[],
	orgConnections: Connection[],
	t: (key: string) => string
): ConnectionGroup[] => {
	const baseTriggerTypeOptions = [...baseTriggerTypes];
	const projectConnectionOptions =
		connections?.map((item: Connection) => ({
			label: item.name,
			ariaLabel: item.name,
			value: item.connectionId,
			icon: item.logo,
			connectionStatus: getConnectionStatus(item.status, item.statusInfoMessage),
		})) || [];
	const organizationConnectionOptions = orgConnections.map((item: Connection) => ({
		label: item.name,
		value: item.connectionId,
		icon: item.logo,
		ariaLabel: item.name,
		connectionStatus: getConnectionStatus(item.status, item.statusInfoMessage),
	}));

	const groups: ConnectionGroup[] = [
		{
			label: "",
			options: baseTriggerTypeOptions,
			hideHeader: true,
		},
	];

	if (projectConnectionOptions.length > 0) {
		groups.push({
			label: t("connectionGroups.projectConnections"),
			options: projectConnectionOptions,
		});
	}

	if (organizationConnectionOptions.length > 0) {
		groups.push({
			label: t("connectionGroups.organizationConnections"),
			options: organizationConnectionOptions,
		});
	}

	return groups;
};
