import React from "react";

import { selectIntegrationGoogle } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { googleFormsIntegrationSchema, legacyOauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const GoogleFormsIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.forms}
		schemas={{
			[ConnectionAuthType.JsonKey]: googleFormsIntegrationSchema,
			[ConnectionAuthType.Oauth]: legacyOauthSchema,
		}}
		selectOptions={selectIntegrationGoogle}
	/>
);
