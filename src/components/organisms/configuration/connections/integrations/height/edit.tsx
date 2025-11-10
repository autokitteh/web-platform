import React from "react";

import { heightIntegrationAuthMethods } from "@src/constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { heightApiKeyIntegrationSchema, heightPrivateAuthIntegrationSchema, legacyOauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const HeightIntegrationEditForm = () => {
	return (
		<IntegrationEditForm
			integrationType={Integrations.height}
			schemas={{
				[ConnectionAuthType.ApiKey]: heightApiKeyIntegrationSchema,
				[ConnectionAuthType.OauthPrivate]: heightPrivateAuthIntegrationSchema,
				[ConnectionAuthType.OauthDefault]: legacyOauthSchema,
			}}
			selectOptions={heightIntegrationAuthMethods}
		/>
	);
};
