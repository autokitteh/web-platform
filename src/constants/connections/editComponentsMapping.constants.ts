import { Integrations } from "@src/enums/components";

import {
	AsanaIntegrationEditForm,
	Auth0IntegrationEditForm,
	AwsIntegrationEditForm,
	ConfluenceIntegrationEditForm,
	DiscordIntegrationEditForm,
	GithubIntegrationEditForm,
	GoogleCalendarIntegrationEditForm,
	GoogleFormsIntegrationEditForm,
	GoogleGeminiIntegrationEditForm,
	GoogleIntegrationEditForm,
	HubspotIntegrationEditForm,
	JiraIntegrationEditForm,
	OpenAiIntegrationEditForm,
	SlackIntegrationEditForm,
	TwilioIntegrationEditForm,
} from "@components/organisms/connections/integrations";

export const integrationToEditComponent: Partial<Record<keyof typeof Integrations, React.ComponentType<any>>> = {
	[Integrations.auth0]: Auth0IntegrationEditForm,
	[Integrations.asana]: AsanaIntegrationEditForm,
	[Integrations.github]: GithubIntegrationEditForm,
	[Integrations.discord]: DiscordIntegrationEditForm,
	[Integrations.jira]: JiraIntegrationEditForm,
	[Integrations.twilio]: TwilioIntegrationEditForm,
	[Integrations.chatgpt]: OpenAiIntegrationEditForm,
	[Integrations.slack]: SlackIntegrationEditForm,
	[Integrations.aws]: AwsIntegrationEditForm,
	[Integrations.googlegemini]: GoogleGeminiIntegrationEditForm,
	[Integrations.confluence]: ConfluenceIntegrationEditForm,
	[Integrations.calendar]: GoogleCalendarIntegrationEditForm,
	[Integrations.sheets]: GoogleIntegrationEditForm,
	[Integrations.gmail]: GoogleIntegrationEditForm,
	[Integrations.drive]: GoogleIntegrationEditForm,
	[Integrations.forms]: GoogleFormsIntegrationEditForm,
	[Integrations.hubspot]: HubspotIntegrationEditForm,
};
