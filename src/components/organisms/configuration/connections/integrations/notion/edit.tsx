import React from "react";

import { notionIntegrationAuthMethods } from "@src/constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { notionApiKeyIntegrationSchema, legacyOauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const NotionIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.notion}
		schemas={{
			[ConnectionAuthType.ApiKey]: notionApiKeyIntegrationSchema,
			[ConnectionAuthType.OauthDefault]: legacyOauthSchema,
		}}
		selectOptions={notionIntegrationAuthMethods}
	/>
);
