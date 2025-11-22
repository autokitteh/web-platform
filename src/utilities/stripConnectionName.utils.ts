import {
	Integrations,
	defaultAtlassianConnectionName,
	defaultGoogleConnectionName,
	defaultMicrosoftConnectionName,
} from "@src/enums/components";

export const stripGoogleConnectionName = (
	connectionName: string | undefined
): keyof typeof Integrations | undefined => {
	if (!connectionName) return undefined;

	if (
		!connectionName.includes(defaultGoogleConnectionName) ||
		connectionName.includes(Integrations.googlegemini) ||
		connectionName === defaultGoogleConnectionName
	) {
		return connectionName as keyof typeof Integrations;
	}

	return connectionName.substring(defaultGoogleConnectionName.length).trim() as keyof typeof Integrations;
};

export const stripMicrosoftConnectionName = (connectionName: string) => {
	if (!connectionName) return undefined;
	const microsoftPrefix = `${defaultMicrosoftConnectionName}_`;

	if (!connectionName.includes(defaultMicrosoftConnectionName) || connectionName === defaultMicrosoftConnectionName) {
		return connectionName as keyof typeof Integrations;
	}

	return connectionName.substring(microsoftPrefix.length).trim() as keyof typeof Integrations;
};

export const stripAtlassianConnectionName = (
	connectionName: string | undefined
): keyof typeof Integrations | undefined => {
	if (!connectionName) return undefined;

	if (!connectionName.includes(defaultAtlassianConnectionName)) {
		return connectionName as keyof typeof Integrations;
	}

	return connectionName.substring(defaultAtlassianConnectionName.length).trim() as keyof typeof Integrations;
};
