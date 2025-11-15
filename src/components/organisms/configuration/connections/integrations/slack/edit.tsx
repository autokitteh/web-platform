import React from "react";

import { selectIntegrationSlack } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { slackIntegrationSchema, slackPrivateAuthIntegrationSchema, genericDefaultOauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const SlackIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.slack}
		schemas={{
			[ConnectionAuthType.Socket]: slackIntegrationSchema,
			[ConnectionAuthType.OauthDefault]: genericDefaultOauthSchema,
			[ConnectionAuthType.OauthPrivate]: slackPrivateAuthIntegrationSchema,
		}}
		selectOptions={selectIntegrationSlack}
	/>
);
