import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";

import {
	ConfluenceApiTokenForm,
	ConfluenceOauthForm,
} from "@components/organisms/configuration/connections/integrations/confluence/authMethods";
import {
	OauthForm,
	OauthPrivateForm,
	PatForm,
} from "@components/organisms/configuration/connections/integrations/github/authMethods";
import {
	JsonGoogleForm,
	OauthGoogleForm,
} from "@components/organisms/configuration/connections/integrations/google/authMethods";
import {
	JsonGoogleCalendarForm,
	OauthGoogleCalendarForm,
} from "@components/organisms/configuration/connections/integrations/googlecalendar/authMethods";
import {
	JsonGoogleFormsForm,
	OauthGoogleFormsForm,
} from "@components/organisms/configuration/connections/integrations/googleforms/authMethods";
import {
	ApiTokenJiraForm,
	OauthJiraForm,
} from "@components/organisms/configuration/connections/integrations/jira/authMethods";
import {
	LinearOauthPrivateForm,
	LinearOauthForm,
	LinearApiKeyForm,
} from "@components/organisms/configuration/connections/integrations/linear/authMethods";
import {
	MicrosoftTeamsOauthForm,
	MicrosoftTeamsOauthPrivateForm,
	MicrosoftTeamsDaemonForm,
} from "@components/organisms/configuration/connections/integrations/microsoft/teams";
import {
	NotionOauthForm,
	NotionApiKeyForm,
} from "@components/organisms/configuration/connections/integrations/notion/authMethods";
import {
	SalesforceOauthPrivateForm,
	SalesforceOauthForm,
} from "@components/organisms/configuration/connections/integrations/salesforce/authMethods";
import {
	OauthForm as SlackOauthForm,
	SocketForm,
	SlackOauthPrivateForm,
} from "@components/organisms/configuration/connections/integrations/slack/authMethods";
import { ApiTokenTwilioForm } from "@components/organisms/configuration/connections/integrations/twilio/authMethods";
import {
	ZoomOauthForm,
	ZoomOauthPrivateForm,
	ZoomServerToServerForm,
} from "@components/organisms/configuration/connections/integrations/zoom/authMethods";

export const formsPerIntegrationsMapping: Partial<
	Record<keyof typeof Integrations, Partial<Record<ConnectionAuthType, React.ComponentType<any>>>>
> = {
	[Integrations.github]: {
		[ConnectionAuthType.Pat]: PatForm,
		[ConnectionAuthType.OauthDefault]: OauthForm,
		// TODO: remove after github private oauth is implemented
		[ConnectionAuthType.Oauth]: OauthForm,
		[ConnectionAuthType.OauthPrivate]: OauthPrivateForm,
	},
	[Integrations.slack]: {
		[ConnectionAuthType.Socket]: SocketForm,
		[ConnectionAuthType.OauthDefault]: SlackOauthForm,
		[ConnectionAuthType.OauthPrivate]: SlackOauthPrivateForm,
	},
	[Integrations.twilio]: {
		[ConnectionAuthType.ApiToken]: ApiTokenTwilioForm,
	},
	[Integrations.gmail]: {
		[ConnectionAuthType.Oauth]: OauthGoogleForm,
		[ConnectionAuthType.Json]: JsonGoogleForm,
	},
	[Integrations.sheets]: {
		[ConnectionAuthType.Oauth]: OauthGoogleForm,
		[ConnectionAuthType.Json]: JsonGoogleForm,
	},
	[Integrations.drive]: {
		[ConnectionAuthType.Oauth]: OauthGoogleForm,
		[ConnectionAuthType.Json]: JsonGoogleForm,
	},
	[Integrations.calendar]: {
		[ConnectionAuthType.Oauth]: OauthGoogleCalendarForm,
		[ConnectionAuthType.Json]: JsonGoogleCalendarForm,
	},
	[Integrations.forms]: {
		[ConnectionAuthType.Oauth]: OauthGoogleFormsForm,
		[ConnectionAuthType.Json]: JsonGoogleFormsForm,
	},
	[Integrations.jira]: {
		[ConnectionAuthType.ApiToken]: ApiTokenJiraForm,
		[ConnectionAuthType.Oauth]: OauthJiraForm,
	},
	[Integrations.confluence]: {
		[ConnectionAuthType.ApiToken]: ConfluenceApiTokenForm,
		[ConnectionAuthType.Oauth]: ConfluenceOauthForm,
	},
	[Integrations.linear]: {
		[ConnectionAuthType.OauthDefault]: LinearOauthForm,
		[ConnectionAuthType.OauthPrivate]: LinearOauthPrivateForm,
		[ConnectionAuthType.ApiKey]: LinearApiKeyForm,
	},
	[Integrations.zoom]: {
		[ConnectionAuthType.OauthDefault]: ZoomOauthForm,
		[ConnectionAuthType.OauthPrivate]: ZoomOauthPrivateForm,
		[ConnectionAuthType.serverToServer]: ZoomServerToServerForm,
	},
	[Integrations.microsoft_teams]: {
		[ConnectionAuthType.OauthDefault]: MicrosoftTeamsOauthForm,
		[ConnectionAuthType.OauthPrivate]: MicrosoftTeamsOauthPrivateForm,
		[ConnectionAuthType.DaemonApp]: MicrosoftTeamsDaemonForm,
	},
	[Integrations.salesforce]: {
		[ConnectionAuthType.OauthDefault]: SalesforceOauthForm,
		[ConnectionAuthType.OauthPrivate]: SalesforceOauthPrivateForm,
	},
	[Integrations.youtube]: {
		[ConnectionAuthType.Oauth]: OauthGoogleForm,
		[ConnectionAuthType.Json]: JsonGoogleForm,
	},
	[Integrations.notion]: {
		[ConnectionAuthType.OauthDefault]: NotionOauthForm,
		[ConnectionAuthType.ApiKey]: NotionApiKeyForm,
	},
};
