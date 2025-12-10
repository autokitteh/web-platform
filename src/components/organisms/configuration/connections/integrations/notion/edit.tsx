import React from "react";

import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { notionApiKeyIntegrationSchema, legacyOauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const NotionIntegrationEditForm = () => {
	return (
		<IntegrationEditForm
			integrationType={Integrations.notion}
			schemas={{
				[ConnectionAuthType.ApiKey]: notionApiKeyIntegrationSchema,
				[ConnectionAuthType.OauthDefault]: legacyOauthSchema,
			}}
		/>
	);
};
