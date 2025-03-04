import { Integrations, defaultAtlassianConnectionName, defaultGoogleConnectionName } from "@src/enums/components";

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

export const stripAtlassianConnectionName = (connectionName: string) => {
	if (!connectionName) return "";

	if (!connectionName.includes(defaultAtlassianConnectionName)) {
		return connectionName;
	}

	return connectionName.substring(defaultAtlassianConnectionName.length).trim();
};
