import { Integrations } from "@src/enums/components";

import {
	AwsIntegrationAddForm,
	DiscordIntegrationAddForm,
	GithubIntegrationAddForm,
	GoogleGeminiIntegrationAddForm,
	GoogleIntegrationAddForm,
	HttpIntegrationAddForm,
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
	calendar: GoogleIntegrationAddForm,
	drive: GoogleIntegrationAddForm,
	forms: GoogleIntegrationAddForm,
	googlegemini: GoogleGeminiIntegrationAddForm,
	aws: AwsIntegrationAddForm,
	chatgpt: OpenAiIntegrationAddForm,
	http: HttpIntegrationAddForm,
	twilio: TwilioIntegrationAddForm,
	jira: JiraIntegrationAddForm,
	confluence: JiraIntegrationAddForm,
	discord: DiscordIntegrationAddForm,
};
