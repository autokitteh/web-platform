import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";

import {
	ConfluenceApiTokenForm,
	ConfluenceOauthForm,
} from "@components/organisms/connections/integrations/confluence/authMethods";
import { OauthForm, PatForm } from "@components/organisms/connections/integrations/github/authMethods";
import { JsonKeyGoogleForm, OauthGoogleForm } from "@components/organisms/connections/integrations/google/authMethods";
import {
	JsonKeyGoogleCalendarForm,
	OauthGoogleCalendarForm,
} from "@components/organisms/connections/integrations/googlecalendar/authMethods";
import {
	JsonKeyGoogleFormsForm,
	OauthGoogleFormsForm,
} from "@components/organisms/connections/integrations/googleforms/authMethods";
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
	Record<keyof typeof Integrations, Partial<Record<ConnectionAuthType, React.ComponentType<any>>>>
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
	[Integrations.gmail]: {
		[ConnectionAuthType.Oauth]: OauthGoogleForm,
		[ConnectionAuthType.JsonKey]: JsonKeyGoogleForm,
	},
	[Integrations.sheets]: {
		[ConnectionAuthType.Oauth]: OauthGoogleForm,
		[ConnectionAuthType.JsonKey]: JsonKeyGoogleForm,
	},
	[Integrations.drive]: {
		[ConnectionAuthType.Oauth]: OauthGoogleForm,
		[ConnectionAuthType.JsonKey]: JsonKeyGoogleForm,
	},
	[Integrations.calendar]: {
		[ConnectionAuthType.Oauth]: OauthGoogleCalendarForm,
		[ConnectionAuthType.JsonKey]: JsonKeyGoogleCalendarForm,
	},
	[Integrations.forms]: {
		[ConnectionAuthType.Oauth]: OauthGoogleFormsForm,
		[ConnectionAuthType.JsonKey]: JsonKeyGoogleFormsForm,
	},
	[Integrations.jira]: {
		[ConnectionAuthType.ApiToken]: ApiTokenJiraForm,
		[ConnectionAuthType.Oauth]: OauthJiraForm,
	},
	[Integrations.confluence]: {
		[ConnectionAuthType.ApiToken]: ConfluenceApiTokenForm,
		[ConnectionAuthType.Oauth]: ConfluenceOauthForm,
	},
};
