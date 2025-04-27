import React from "react";

import { microsoftTeamsIntegrationAuthMethods } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@enums/components";
import { oauthSchema, microsoftTeamsIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations";

export const MicrosoftTeamsIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.microsoft_teams}
		schemas={{
			[ConnectionAuthType.OauthDefault]: oauthSchema,
			[ConnectionAuthType.OauthPrivate]: microsoftTeamsIntegrationSchema,
			[ConnectionAuthType.DaemonApp]: microsoftTeamsIntegrationSchema,
		}}
		selectOptions={microsoftTeamsIntegrationAuthMethods}
	/>
);
