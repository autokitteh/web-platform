import React from "react";

import { linearIntegrationAuthMethods } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@enums/components";
import { linearPrivateAuthIntegrationSchema, oauthSchema, linearApiKeyIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations";

export const LinearIntegrationEditForm = () => {
	return (
		<IntegrationEditForm
			integrationType={Integrations.linear}
			schemas={{
				[ConnectionAuthType.ApiKey]: linearApiKeyIntegrationSchema,
				[ConnectionAuthType.OauthPrivate]: linearPrivateAuthIntegrationSchema,
				[ConnectionAuthType.OauthDefault]: oauthSchema,
			}}
			selectOptions={linearIntegrationAuthMethods}
		/>
	);
};
