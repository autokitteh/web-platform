import { Integrations } from "@src/enums/components";

import { ConfluenceIntegrationEditForm } from "@components/organisms/connections/integrations";
import { AwsIntegrationEditForm } from "@components/organisms/connections/integrations/aws";
import { DiscordIntegrationEditForm } from "@components/organisms/connections/integrations/discord";
import { GithubIntegrationEditForm } from "@components/organisms/connections/integrations/github";
import { GoogleIntegrationEditForm } from "@components/organisms/connections/integrations/google";
import { GoogleGeminiIntegrationEditForm } from "@components/organisms/connections/integrations/googleGemini";
import { JiraIntegrationEditForm } from "@components/organisms/connections/integrations/jira";
import { OpenAiIntegrationEditForm } from "@components/organisms/connections/integrations/openAI";
import { SlackIntegrationEditForm } from "@components/organisms/connections/integrations/slack";
import { TwilioIntegrationEditForm } from "@components/organisms/connections/integrations/twilio";

export const integrationToEditComponent: Partial<Record<keyof typeof Integrations, React.ComponentType<any>>> = {
	[Integrations.github]: GithubIntegrationEditForm,
	[Integrations.discord]: DiscordIntegrationEditForm,
	[Integrations.jira]: JiraIntegrationEditForm,
	[Integrations.twilio]: TwilioIntegrationEditForm,
	[Integrations.chatgpt]: OpenAiIntegrationEditForm,
	[Integrations.slack]: SlackIntegrationEditForm,
	[Integrations.aws]: AwsIntegrationEditForm,
	[Integrations.googlegemini]: GoogleGeminiIntegrationEditForm,
	[Integrations.confluence]: ConfluenceIntegrationEditForm,
	[Integrations.google]: GoogleIntegrationEditForm,
	[Integrations.sheets]: GoogleIntegrationEditForm,
	[Integrations.calendar]: GoogleIntegrationEditForm,
	[Integrations.gmail]: GoogleIntegrationEditForm,
	[Integrations.drive]: GoogleIntegrationEditForm,
	[Integrations.forms]: GoogleIntegrationEditForm,
};
