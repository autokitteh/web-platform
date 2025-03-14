import React from "react";

import { salesforceIntegrationAuthMethods } from "@src/constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { salesforcePrivateAuthIntegrationSchema, oauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations";

export const SalesforceIntegrationEditForm = () => {
	return (
		<IntegrationEditForm
			integrationType={Integrations.salesforce}
			schemas={{
				[ConnectionAuthType.OauthPrivate]: salesforcePrivateAuthIntegrationSchema,
				[ConnectionAuthType.OauthDefault]: oauthSchema,
			}}
			selectOptions={salesforceIntegrationAuthMethods}
		/>
	);
};
