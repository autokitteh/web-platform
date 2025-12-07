import { ConnectionStatus } from "@src/enums/components/connection.enum";

export const connectionsColors = {
	[ConnectionStatus.error]: "text-red hover:bg-red/10",
	[ConnectionStatus.ok]: "text-green-800 hover:bg-green-800/10",
	[ConnectionStatus.unspecified]: "text-blue-500 hover:bg-blue-500/10",
	[ConnectionStatus.warning]: "text-yellow-500 hover:bg-yellow-500/10",
	[ConnectionStatus.init_required]: "text-orange-500 hover:bg-orange-500/10",
};
