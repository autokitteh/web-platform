import { Integrations } from "@src/enums/components";

export const stripGoogleConnectionName = (connectionName?: string) => {
	if (!connectionName) return;
	if (connectionName === Integrations.google) return;

	if (!connectionName.includes(Integrations.google)) {
		return connectionName;
	}

	return connectionName.substring(Integrations.google.length);
};
