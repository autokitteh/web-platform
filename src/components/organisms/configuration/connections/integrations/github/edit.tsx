import React from "react";

import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { githubIntegrationSchema, legacyOauthSchema, githubPrivateAuthIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const GithubIntegrationEditForm = () => {
	return (
		<IntegrationEditForm
			integrationType={Integrations.github}
			schemas={{
				[ConnectionAuthType.Pat]: githubIntegrationSchema,
				[ConnectionAuthType.Oauth]: legacyOauthSchema,
				[ConnectionAuthType.OauthDefault]: legacyOauthSchema,
				[ConnectionAuthType.OauthPrivate]: githubPrivateAuthIntegrationSchema,
			}}
		/>
	);
};
