import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";

import { OauthForm, PatForm } from "@components/organisms/connections/integrations/github/authMethods";
import { JsonKeyGoogleForm, OauthGoogleForm } from "@components/organisms/connections/integrations/google/authMethods";
import {
	HttpBasicForm,
	HttpBearerForm,
	HttpOauthForm,
} from "@components/organisms/connections/integrations/http/authMethods";
import { ApiTokenJiraForm, OauthJiraForm } from "@components/organisms/connections/integrations/jira/authMethods";
import {
	OauthForm as SlackOauthForm,
	SocketForm,
} from "@components/organisms/connections/integrations/slack/authMethods";
import {
	ApiKeyTwilioForm,
	AuthTokenTwilioForm,
} from "@components/organisms/connections/integrations/twilio/authMethods";

export const formsPerIntegrationsMapping: Partial<
	Record<Integrations, Partial<Record<ConnectionAuthType, React.ComponentType<any>>>>
> = {
	[Integrations.github]: {
		[ConnectionAuthType.Pat]: PatForm,
		[ConnectionAuthType.Oauth]: OauthForm,
	},
	[Integrations.slack]: {
		[ConnectionAuthType.Socket]: SocketForm,
		[ConnectionAuthType.Oauth]: SlackOauthForm,
	},
	[Integrations.twilio]: {
		[ConnectionAuthType.ApiKey]: ApiKeyTwilioForm,
		[ConnectionAuthType.AuthToken]: AuthTokenTwilioForm,
	},
	[Integrations.google]: {
		[ConnectionAuthType.Oauth]: OauthGoogleForm,
		[ConnectionAuthType.JsonKey]: JsonKeyGoogleForm,
	},
	[Integrations.jira]: {
		[ConnectionAuthType.ApiToken]: ApiTokenJiraForm,
		[ConnectionAuthType.Oauth]: OauthJiraForm,
	},
	[Integrations.http]: {
		[ConnectionAuthType.Basic]: HttpBasicForm,
		[ConnectionAuthType.Bearer]: HttpBearerForm,
		[ConnectionAuthType.NoAuth]: HttpOauthForm,
	},
};
