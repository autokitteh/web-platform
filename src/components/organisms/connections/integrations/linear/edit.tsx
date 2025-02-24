import React from "react";

import { linearIntegrationAuthMethods } from "@src/constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import {
	linearPrivateAuthIntegrationSchema,
	linearDefaultAuthIntegrationSchema,
	linearApiKeyIntegrationSchema,
} from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations";

export const LinearIntegrationEditForm = () => {
	return (
		<IntegrationEditForm
			integrationType={Integrations.linear}
			schemas={{
				[ConnectionAuthType.ApiKey]: linearApiKeyIntegrationSchema,
				[ConnectionAuthType.OauthPrivate]: linearPrivateAuthIntegrationSchema,
				[ConnectionAuthType.OauthDefault]: linearDefaultAuthIntegrationSchema,
			}}
			selectOptions={linearIntegrationAuthMethods}
		/>
	);
};
