import { connectionsColors } from "@src/constants/connections";
import { ConnectionStatus } from "@src/enums";
import { ConnectionStatusType } from "@src/types/models";
import { cn } from "@src/utilities";

export const getConnectionStatusColorByStatus = (status: ConnectionStatusType): string => {
	const connectionColorByStatus = cn("inline", connectionsColors[ConnectionStatus[status]]);
	return connectionColorByStatus;
};
