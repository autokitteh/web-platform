import React from "react";

import { selectIntegrationConfluence } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { confluenceApiTokenIntegrationSchema, confluencePatIntegrationSchema, legacyOauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const ConfluenceIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.confluence}
		schemas={{
			[ConnectionAuthType.ApiToken]: confluenceApiTokenIntegrationSchema,
			[ConnectionAuthType.Pat]: confluencePatIntegrationSchema,
			[ConnectionAuthType.Oauth]: legacyOauthSchema,
		}}
		selectOptions={selectIntegrationConfluence}
	/>
);
