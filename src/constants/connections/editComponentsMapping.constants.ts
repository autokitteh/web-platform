import { Integrations } from "@src/enums/components";

import { DiscordIntegrationEditForm } from "@components/organisms/connections/integrations/discord";
import { GithubIntegrationEditForm } from "@components/organisms/connections/integrations/github";
import { JiraIntegrationEditForm } from "@components/organisms/connections/integrations/jira";

export const integrationToEditComponent: Partial<Record<Integrations, React.ComponentType<any>>> = {
	[Integrations.github]: GithubIntegrationEditForm,
	[Integrations.discord]: DiscordIntegrationEditForm,
	[Integrations.jira]: JiraIntegrationEditForm,
};
