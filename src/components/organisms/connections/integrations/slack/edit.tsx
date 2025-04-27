import React from "react";

import { selectIntegrationSlack } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@enums/components";
import { oauthSchema, slackIntegrationSchema, slackPrivateAuthIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations";

export const SlackIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.slack}
		schemas={{
			[ConnectionAuthType.Socket]: slackIntegrationSchema,
			[ConnectionAuthType.Oauth]: oauthSchema,
			[ConnectionAuthType.OauthDefault]: oauthSchema,
			[ConnectionAuthType.OauthPrivate]: slackPrivateAuthIntegrationSchema,
		}}
		selectOptions={selectIntegrationSlack}
	/>
);
