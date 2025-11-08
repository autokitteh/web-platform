import React from "react";

import { selectIntegrationJira } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { jiraIntegrationSchema, oauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const JiraIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.jira}
		schemas={{
			[ConnectionAuthType.ApiToken]: jiraIntegrationSchema,
			[ConnectionAuthType.Oauth]: oauthSchema,
		}}
		selectOptions={selectIntegrationJira}
	/>
);
