import React from "react";

import { githubIntegrationAuthMethods } from "@constants/lists";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { githubIntegrationSchema, oauthSchema, githubPrivateAuthIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const GithubIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.github}
		schemas={{
			[ConnectionAuthType.Pat]: githubIntegrationSchema,
			[ConnectionAuthType.Oauth]: oauthSchema,
			[ConnectionAuthType.OauthDefault]: oauthSchema,
			[ConnectionAuthType.OauthPrivate]: githubPrivateAuthIntegrationSchema,
		}}
		selectOptions={githubIntegrationAuthMethods}
	/>
);
