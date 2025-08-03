// Slack integrations
export type { SlackOauthPrivateFormProps } from "./slack/authMethods/oauthPrivate.interface";

// Zoom integrations
export type { ZoomOauthPrivateFormProps } from "./zoom/authMethods/oauthPrivate.interface";
export type { ZoomServerToServerFormProps } from "./zoom/authMethods/serverToServer.interface";

// Microsoft Teams integrations
export type {
	FormValues as MicrosoftTeamsFormValues,
	MicrosoftTeamsOauthPrivateFormProps,
} from "./microsoft/teams/authMethods/oauthPrivate.interface";
export type {
	FormValues as MicrosoftTeamsDaemonFormValues,
	MicrosoftTeamsDaemonFormProps,
} from "./microsoft/teams/authMethods/daemon.interface";
