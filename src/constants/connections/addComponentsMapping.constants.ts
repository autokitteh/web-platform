import { Integrations } from "@src/enums/components";

import {
	AsanaIntegrationAddForm,
	Auth0IntegrationAddForm,
	AwsIntegrationAddForm,
	ConfluenceIntegrationAddForm,
	DiscordIntegrationAddForm,
	GithubIntegrationAddForm,
	GoogleCalendarIntegrationAddForm,
	GoogleFormsIntegrationAddForm,
	GoogleGeminiIntegrationAddForm,
	GoogleIntegrationAddForm,
	HubspotIntegrationAddForm,
	JiraIntegrationAddForm,
	OpenAiIntegrationAddForm,
	SlackIntegrationAddForm,
	TwilioIntegrationAddForm,
} from "@components/organisms/connections/integrations";

export const integrationAddFormComponents: Partial<Record<keyof typeof Integrations, React.ComponentType<any>>> = {
	auth0: Auth0IntegrationAddForm,
	asana: AsanaIntegrationAddForm,
	github: GithubIntegrationAddForm,
	slack: SlackIntegrationAddForm,
	gmail: GoogleIntegrationAddForm,
	sheets: GoogleIntegrationAddForm,
	calendar: GoogleCalendarIntegrationAddForm,
	drive: GoogleIntegrationAddForm,
	forms: GoogleFormsIntegrationAddForm,
	googlegemini: GoogleGeminiIntegrationAddForm,
	aws: AwsIntegrationAddForm,
	chatgpt: OpenAiIntegrationAddForm,
	twilio: TwilioIntegrationAddForm,
	jira: JiraIntegrationAddForm,
	confluence: ConfluenceIntegrationAddForm,
	discord: DiscordIntegrationAddForm,
	hubspot: HubspotIntegrationAddForm,
};
