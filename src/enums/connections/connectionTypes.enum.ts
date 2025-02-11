import { featureFlags } from "@constants";

const oauthDefaultValue = featureFlags.modernConnOAuthType ? "oauthDefault" : "oauth";

export const ConnectionAuthType = {
	Oauth: "oauth",
	OauthDefault: oauthDefaultValue,
	OauthPrivate: "oauthPrivate",
	Pat: "pat",
	ServiceAccount: "serviceAccount",
	Mode: "mode",
	NoAuth: "noauth",
	Basic: "basic",
	Bearer: "bearer",
	ApiKey: "apiKey",
	Key: "key",
	JsonKey: "jsonKey",
	Json: "json",
	ApiToken: "apiToken",
	AuthToken: "authToken",
	AWSConfig: "awsConfig",
	Socket: "socket",
	BotToken: "botToken",
} as const;
