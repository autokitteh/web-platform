import React from "react";

import { featureFlags } from "@src/constants";
import { heightIntegrationAuthMethods } from "@src/constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { heightApiKeyIntegrationSchema, heightPrivateAuthIntegrationSchema, oauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations";

export const HeightIntegrationEditForm = () => {
	// TODO: remove ConnectionAuthType.Oauth and move to ConnectionAuthType.OauthDefault once the migration is ready and done
	const heightLegacyOAuthType = !featureFlags.slackModernOAuthType
		? { [ConnectionAuthType.Oauth]: oauthSchema }
		: { [ConnectionAuthType.OauthDefault]: oauthSchema };

	return (
		<IntegrationEditForm
			integrationType={Integrations.height}
			schemas={{
				[ConnectionAuthType.ApiKey]: heightApiKeyIntegrationSchema,
				[ConnectionAuthType.OauthPrivate]: heightPrivateAuthIntegrationSchema,
				...heightLegacyOAuthType,
			}}
			selectOptions={heightIntegrationAuthMethods}
		/>
	);
};
