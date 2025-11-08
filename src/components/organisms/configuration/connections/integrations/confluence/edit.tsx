import React from "react";

import { selectIntegrationJira } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { confluenceIntegrationSchema, oauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const ConfluenceIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.confluence}
		schemas={{
			[ConnectionAuthType.ApiToken]: confluenceIntegrationSchema,
			[ConnectionAuthType.Oauth]: oauthSchema,
		}}
		selectOptions={selectIntegrationJira}
	/>
);
