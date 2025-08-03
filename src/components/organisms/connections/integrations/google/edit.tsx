import React from "react";

import { selectIntegrationGoogle } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { GoogleIntegrationType } from "@src/types";
import { googleIntegrationSchema, oauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations";

export const GoogleIntegrationEditForm = ({
	googleIntegrationApplication,
}: {
	googleIntegrationApplication: GoogleIntegrationType;
}) => (
	<IntegrationEditForm
		integrationType={googleIntegrationApplication}
		schemas={{
			[ConnectionAuthType.JsonKey]: googleIntegrationSchema,
			[ConnectionAuthType.Oauth]: oauthSchema,
		}}
		selectOptions={selectIntegrationGoogle}
	/>
);
