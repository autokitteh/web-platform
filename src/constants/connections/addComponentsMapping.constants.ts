import { Integrations } from "@src/enums/components";

import {
	AwsIntegrationAddForm,
	ConfluenceIntegrationAddForm,
	DiscordIntegrationAddForm,
	GithubIntegrationAddForm,
	GoogleCalendarIntegrationAddForm,
	GoogleGeminiIntegrationAddForm,
	GoogleIntegrationAddForm,
	JiraIntegrationAddForm,
	OpenAiIntegrationAddForm,
	SlackIntegrationAddForm,
	TwilioIntegrationAddForm,
} from "@components/organisms/connections/integrations";

export const integrationAddFormComponents: Partial<Record<keyof typeof Integrations, React.ComponentType<any>>> = {
	github: GithubIntegrationAddForm,
	slack: SlackIntegrationAddForm,
	gmail: GoogleIntegrationAddForm,
	google: GoogleIntegrationAddForm,
	sheets: GoogleIntegrationAddForm,
	calendar: GoogleCalendarIntegrationAddForm,
	drive: GoogleIntegrationAddForm,
	forms: GoogleIntegrationAddForm,
	googlegemini: GoogleGeminiIntegrationAddForm,
	aws: AwsIntegrationAddForm,
	chatgpt: OpenAiIntegrationAddForm,
	twilio: TwilioIntegrationAddForm,
	jira: JiraIntegrationAddForm,
	confluence: ConfluenceIntegrationAddForm,
	discord: DiscordIntegrationAddForm,
};
