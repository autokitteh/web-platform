import { ConnectionAuthType } from "@src/enums";

export const defaultConnectionsAuthTypes = [
	ConnectionAuthType.Oauth,
	ConnectionAuthType.OauthDefault,
	ConnectionAuthType.OauthUser,
	ConnectionAuthType.MicrosoftOauthDefault,
	ConnectionAuthType.OauthApp,
];
export const customConnectionsAuthTypes = new Set([
	ConnectionAuthType.OauthPrivate,
	ConnectionAuthType.Oauth,
	ConnectionAuthType.OauthDefault,
]);

export type CustomConnectionAuthType =
	| ConnectionAuthType.OauthPrivate
	| ConnectionAuthType.Oauth
	| ConnectionAuthType.OauthDefault;
