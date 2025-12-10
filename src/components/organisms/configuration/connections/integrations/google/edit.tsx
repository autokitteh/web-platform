import React from "react";

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
			[ConnectionAuthType.Json]: googleJsonIntegrationSchema,
			[ConnectionAuthType.Oauth]: legacyOauthSchema,
		}}
	/>
);
