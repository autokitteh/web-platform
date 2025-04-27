import React from "react";

import { selectIntegrationGoogle } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@enums/components";
import { googleFormsIntegrationSchema, oauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations";

export const GoogleFormsIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.forms}
		schemas={{
			[ConnectionAuthType.JsonKey]: googleFormsIntegrationSchema,
			[ConnectionAuthType.Oauth]: oauthSchema,
		}}
		selectOptions={selectIntegrationGoogle}
	/>
);
