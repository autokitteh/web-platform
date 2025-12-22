import React from "react";

import { IntegrationEditFormProps } from "@interfaces/components";
import { linearIntegrationAuthMethods } from "@src/constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import {
	linearPrivateAuthIntegrationSchema,
	linearApiKeyIntegrationSchema,
	linearOauthIntegrationSchema,
} from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const LinearIntegrationEditForm = ({ editedConnectionName }: IntegrationEditFormProps) => (
	<IntegrationEditForm
		editedConnectionName={editedConnectionName}
		integrationType={Integrations.linear}
		schemas={{
			[ConnectionAuthType.ApiKey]: linearApiKeyIntegrationSchema,
			[ConnectionAuthType.OauthPrivate]: linearPrivateAuthIntegrationSchema,
			[ConnectionAuthType.OauthDefault]: linearOauthIntegrationSchema,
		}}
		selectOptions={linearIntegrationAuthMethods}
	/>
);
