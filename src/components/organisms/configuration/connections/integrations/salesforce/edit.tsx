import React from "react";

import { IntegrationEditFormProps } from "@interfaces/components";
import { salesforceIntegrationAuthMethods } from "@src/constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { salesforcePrivateAuthIntegrationSchema, legacyOauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const SalesforceIntegrationEditForm = ({ editedConnectionName }: IntegrationEditFormProps) => (
	<IntegrationEditForm
		editedConnectionName={editedConnectionName}
		integrationType={Integrations.salesforce}
		schemas={{
			[ConnectionAuthType.OauthPrivate]: salesforcePrivateAuthIntegrationSchema,
			[ConnectionAuthType.OauthDefault]: legacyOauthSchema,
		}}
		selectOptions={salesforceIntegrationAuthMethods}
	/>
);
