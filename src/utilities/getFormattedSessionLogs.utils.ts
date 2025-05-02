import { SessionOutputLog } from "@src/interfaces/models/session.interface";

export const getFormattedSessionLogs = async (
	getAllSessionLogs: (pageToken: string) => Promise<SessionOutputLog[]>
): Promise<string> => {
	const logs = await getAllSessionLogs("");

	return logs
		.reverse()
		.map((log) => `[${log.time}]: ${log.print}`)
		.join("\n");
};
