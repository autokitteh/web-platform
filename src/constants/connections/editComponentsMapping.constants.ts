import { Integrations } from "@src/enums/components";

import { AwsIntegrationEditForm } from "@components/organisms/connections/integrations/aws";
import { DiscordIntegrationEditForm } from "@components/organisms/connections/integrations/discord";
import { GithubIntegrationEditForm } from "@components/organisms/connections/integrations/github";
import { GoogleGeminiIntegrationEditForm } from "@components/organisms/connections/integrations/googleGemini";
import { HttpIntegrationEditForm } from "@components/organisms/connections/integrations/http";
import { JiraIntegrationEditForm } from "@components/organisms/connections/integrations/jira";
import { OpenAiIntegrationEditForm } from "@components/organisms/connections/integrations/openAI";
import { SlackIntegrationEditForm } from "@components/organisms/connections/integrations/slack";
import { TwilioIntegrationEditForm } from "@components/organisms/connections/integrations/twilio";

export const integrationToEditComponent: Partial<Record<keyof typeof Integrations, React.ComponentType<any>>> = {
	[Integrations.github]: GithubIntegrationEditForm,
	[Integrations.discord]: DiscordIntegrationEditForm,
	[Integrations.jira]: JiraIntegrationEditForm,
	[Integrations.http]: HttpIntegrationEditForm,
	[Integrations.twilio]: TwilioIntegrationEditForm,
	[Integrations.chatgpt]: OpenAiIntegrationEditForm,
	[Integrations.slack]: SlackIntegrationEditForm,
	[Integrations.aws]: AwsIntegrationEditForm,
	[Integrations.googlegemini]: GoogleGeminiIntegrationEditForm,
	[Integrations.confluence]: JiraIntegrationEditForm,
};
