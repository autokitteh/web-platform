import { Integrations } from "@src/enums/components";

import { GithubIntegrationEditForm, SlackIntegrationEditForm } from "@components/organisms/connections/integrations";

export const integrationToEditComponent: Partial<Record<Integrations, React.ComponentType<any>>> = {
	[Integrations.github]: GithubIntegrationEditForm,
	[Integrations.slack]: SlackIntegrationEditForm,
};
