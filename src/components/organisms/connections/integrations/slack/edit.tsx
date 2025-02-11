import React from "react";

import { selectIntegrationSlack } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { featureFlags } from "@src/constants";
import { Integrations } from "@src/enums/components";
import { oauthSchema, slackIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations";

export const SlackIntegrationEditForm = () => {
	const slackLegacyOAuthType = !featureFlags.slackModernOAuthType
		? { [ConnectionAuthType.Oauth]: oauthSchema }
		: undefined;

	return (
		<IntegrationEditForm
			integrationType={Integrations.slack}
			schemas={{
				[ConnectionAuthType.Socket]: slackIntegrationSchema,
				[ConnectionAuthType.OauthDefault]: oauthSchema,
				...slackLegacyOAuthType,
			}}
			selectOptions={selectIntegrationSlack}
		/>
	);
};
