import { Integrations } from "@src/enums/components";

export const stripGoogleConnectionName = (connectionName: string) => {
	if (connectionName === Integrations.google) return connectionName;

	if (!connectionName.includes(Integrations.google) || connectionName.includes(Integrations.googlegemini)) {
		return connectionName;
	}

	return connectionName.substring(Integrations.google.length);
};
