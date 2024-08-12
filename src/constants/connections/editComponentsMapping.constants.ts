import { Integrations } from "@src/enums/components";

import { GithubIntegrationEditForm } from "@components/organisms/connections/integrations/github";

export const integrationToEditComponent: Partial<Record<Integrations, React.ComponentType<any>>> = {
	[Integrations.github]: GithubIntegrationEditForm,
};
