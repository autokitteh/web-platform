import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";

import {
	ConfluenceApiTokenForm,
	ConfluenceOauthForm,
} from "@components/organisms/connections/integrations/confluence/authMethods";
import {
	OauthForm,
	OauthPrivateForm,
	PatForm,
} from "@components/organisms/connections/integrations/github/authMethods";
import { JsonKeyGoogleForm, OauthGoogleForm } from "@components/organisms/connections/integrations/google/authMethods";
import {
	JsonKeyGoogleCalendarForm,
	OauthGoogleCalendarForm,
} from "@components/organisms/connections/integrations/googlecalendar/authMethods";
import {
	JsonKeyGoogleFormsForm,
	OauthGoogleFormsForm,
} from "@components/organisms/connections/integrations/googleforms/authMethods";
import {
	HeightOauthPrivateForm,
	HeightOauthForm,
	HeightApiKeyForm,
} from "@components/organisms/connections/integrations/height/authMethods";
import { ApiTokenJiraForm, OauthJiraForm } from "@components/organisms/connections/integrations/jira/authMethods";
import {
	OauthForm as SlackOauthForm,
	SocketForm,
	SlackOauthPrivateForm,
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
		[ConnectionAuthType.OauthDefault]: OauthForm,
		// remove after github private oauth is implemented
		[ConnectionAuthType.Oauth]: OauthForm,
		[ConnectionAuthType.OauthPrivate]: OauthPrivateForm,
	},
	[Integrations.slack]: {
		[ConnectionAuthType.Socket]: SocketForm,
		[ConnectionAuthType.OauthDefault]: SlackOauthForm,
		// remove after slack private oauth is implemented
		[ConnectionAuthType.Oauth]: SlackOauthForm,
		[ConnectionAuthType.OauthPrivate]: SlackOauthPrivateForm,
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
	[Integrations.height]: {
		[ConnectionAuthType.OauthDefault]: HeightOauthForm,
		[ConnectionAuthType.OauthPrivate]: HeightOauthPrivateForm,
		[ConnectionAuthType.ApiKey]: HeightApiKeyForm,
	},
};
