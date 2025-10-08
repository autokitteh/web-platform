import React from "react";

import { notionIntegrationAuthMethods } from "@src/constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { notionApiKeyIntegrationSchema, oauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations";

export const NotionIntegrationEditForm = () => {
	return (
		<IntegrationEditForm
			integrationType={Integrations.notion}
			schemas={{
				[ConnectionAuthType.ApiKey]: notionApiKeyIntegrationSchema,
				[ConnectionAuthType.OauthDefault]: oauthSchema,
			}}
			selectOptions={notionIntegrationAuthMethods}
		/>
	);
};
