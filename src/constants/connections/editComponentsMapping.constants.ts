import { Integrations } from "@src/enums/components";

import { DiscordIntegrationEditForm } from "@components/organisms/connections/integrations/discord";
import { GithubIntegrationEditForm } from "@components/organisms/connections/integrations/github";
import { HttpIntegrationEditForm } from "@components/organisms/connections/integrations/http";
import { JiraIntegrationEditForm } from "@components/organisms/connections/integrations/jira";
import { OpenAiIntegrationEditForm } from "@components/organisms/connections/integrations/openAI";
import { TwilioIntegrationEditForm } from "@components/organisms/connections/integrations/twilio";

export const integrationToEditComponent: Partial<Record<Integrations, React.ComponentType<any>>> = {
	[Integrations.github]: GithubIntegrationEditForm,
	[Integrations.discord]: DiscordIntegrationEditForm,
	[Integrations.jira]: JiraIntegrationEditForm,
	[Integrations.http]: HttpIntegrationEditForm,
	[Integrations.twilio]: TwilioIntegrationEditForm,
	[Integrations.chatgpt]: OpenAiIntegrationEditForm,
};
