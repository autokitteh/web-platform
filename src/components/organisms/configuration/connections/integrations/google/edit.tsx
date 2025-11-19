import React from "react";

import { selectIntegrationGoogle } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { GoogleIntegrationType } from "@src/types";
import { googleJsonIntegrationSchema, legacyOauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const GoogleIntegrationEditForm = ({
	googleIntegrationApplication,
}: {
	googleIntegrationApplication: GoogleIntegrationType;
}) => (
	<IntegrationEditForm
		integrationType={googleIntegrationApplication}
		schemas={{
			[ConnectionAuthType.Key]: googleJsonIntegrationSchema,
			[ConnectionAuthType.Oauth]: legacyOauthSchema,
		}}
		selectOptions={selectIntegrationGoogle}
	/>
);
