import { featureFlags } from "../featureFlags.constants";

export const ConnectionAuthType = {
	Oauth: "oauth",
	OauthDefault: featureFlags.modernConnOAuthType ? "oauthDefault" : "oauth",
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

export type ConnectionAuthType = (typeof ConnectionAuthType)[keyof typeof ConnectionAuthType];
