import { Connection, Trigger } from "@src/types/models";

export const getTriggersWithBadConnections = (triggers: Trigger[], connections: Connection[]): Trigger[] => {
	return triggers.filter((trigger) => {
		if (trigger.sourceType === "connection" && trigger.connectionId) {
			const connection = connections.find((c) => c.connectionId === trigger.connectionId);
			return connection && connection.status !== "ok";
		}
		return false;
	});
};
