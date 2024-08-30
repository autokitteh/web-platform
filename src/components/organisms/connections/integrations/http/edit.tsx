import React from "react";

import { selectIntegrationHttp } from "@src/constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { httpBasicIntegrationSchema, httpBearerIntegrationSchema, oauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations/integrationEditForm";

export const HttpIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.http}
		schemas={{
			[ConnectionAuthType.Basic]: httpBasicIntegrationSchema,
			[ConnectionAuthType.Bearer]: httpBearerIntegrationSchema,
			[ConnectionAuthType.NoAuth]: oauthSchema,
		}}
		selectOptions={selectIntegrationHttp}
	/>
);
