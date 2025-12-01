import { ConnectionStatus } from "@src/enums";
import { SelectOptionStatus } from "@src/interfaces/components/forms/select.interface";

export const StatusIndicator = ({ connectionStatus }: { connectionStatus?: SelectOptionStatus }) => {
	if (!connectionStatus?.status || connectionStatus.status === ConnectionStatus.ok) return null;

	const indicatorColor = connectionStatus.status === ConnectionStatus.error ? "bg-error" : "bg-warning";

	return <span className={`inline-block size-2.5 shrink-0 rounded-full ${indicatorColor}`} />;
};
