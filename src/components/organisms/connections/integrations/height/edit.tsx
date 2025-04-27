import React from "react";

import { heightIntegrationAuthMethods } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@enums/components";
import { heightApiKeyIntegrationSchema, heightPrivateAuthIntegrationSchema, oauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations";

export const HeightIntegrationEditForm = () => {
	return (
		<IntegrationEditForm
			integrationType={Integrations.height}
			schemas={{
				[ConnectionAuthType.ApiKey]: heightApiKeyIntegrationSchema,
				[ConnectionAuthType.OauthPrivate]: heightPrivateAuthIntegrationSchema,
				[ConnectionAuthType.OauthDefault]: oauthSchema,
			}}
			selectOptions={heightIntegrationAuthMethods}
		/>
	);
};
