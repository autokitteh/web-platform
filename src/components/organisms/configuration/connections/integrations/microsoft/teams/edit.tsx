import React from "react";

import { microsoftTeamsIntegrationAuthMethods } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { legacyOauthSchema, microsoftTeamsIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const MicrosoftTeamsIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.microsoft_teams}
		schemas={{
			[ConnectionAuthType.OauthDefault]: legacyOauthSchema,
			[ConnectionAuthType.OauthPrivate]: microsoftTeamsIntegrationSchema,
			[ConnectionAuthType.DaemonApp]: microsoftTeamsIntegrationSchema,
		}}
		selectOptions={microsoftTeamsIntegrationAuthMethods}
	/>
);
