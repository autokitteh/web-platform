import { Integrations, defaultGoogleConnectionName } from "@src/enums/components";

export const stripGoogleConnectionName = (connectionName: string) => {
	if (!connectionName) return "";

	if (
		!connectionName.includes(defaultGoogleConnectionName) ||
		connectionName.includes(Integrations.googlegemini) ||
		connectionName === defaultGoogleConnectionName
	) {
		return connectionName;
	}

	return connectionName.substring(defaultGoogleConnectionName.length).trim();
};
