import React from "react";

import { githubIntegrationAuthMethods } from "@constants/lists";
import { ConnectionAuthType } from "@enums";
import { IntegrationEditFormProps } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { githubIntegrationSchema, legacyOauthSchema, githubPrivateAuthIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const GithubIntegrationEditForm = ({ editedConnectionName }: IntegrationEditFormProps) => (
	<IntegrationEditForm
		editedConnectionName={editedConnectionName}
		integrationType={Integrations.github}
		schemas={{
			[ConnectionAuthType.Pat]: githubIntegrationSchema,
			[ConnectionAuthType.Oauth]: legacyOauthSchema,
			[ConnectionAuthType.OauthDefault]: legacyOauthSchema,
			[ConnectionAuthType.OauthPrivate]: githubPrivateAuthIntegrationSchema,
		}}
		selectOptions={githubIntegrationAuthMethods}
	/>
);
