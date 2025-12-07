import { ConnectionStatusType } from "@src/types/models";

export interface ConnectionStatusButtonProps {
	statusInfoMessage?: string;
	onInitClick: () => void;
	className?: string;
	status: ConnectionStatusType;
}
