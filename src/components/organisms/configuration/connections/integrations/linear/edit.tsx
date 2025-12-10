import React from "react";

import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import {
	linearPrivateAuthIntegrationSchema,
	linearApiKeyIntegrationSchema,
	linearOauthIntegrationSchema,
} from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const LinearIntegrationEditForm = () => {
	return (
		<IntegrationEditForm
			integrationType={Integrations.linear}
			schemas={{
				[ConnectionAuthType.ApiKey]: linearApiKeyIntegrationSchema,
				[ConnectionAuthType.OauthPrivate]: linearPrivateAuthIntegrationSchema,
				[ConnectionAuthType.OauthDefault]: linearOauthIntegrationSchema,
			}}
		/>
	);
};
