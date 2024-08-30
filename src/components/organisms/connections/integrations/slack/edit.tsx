import React from "react";

import { selectIntegrationSlack } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { oauthSchema, slackIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations/integrationEditForm";

export const SlackIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.slack}
		schemas={{
			[ConnectionAuthType.AuthToken]: slackIntegrationSchema,
			[ConnectionAuthType.Oauth]: oauthSchema,
		}}
		selectOptions={selectIntegrationSlack}
	/>
);
