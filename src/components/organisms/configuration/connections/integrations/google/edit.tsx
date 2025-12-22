import React from "react";

import { selectIntegrationGoogle } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { IntegrationEditFormProps } from "@interfaces/components";
import { GoogleIntegrationType } from "@src/types";
import { googleJsonIntegrationSchema, legacyOauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const GoogleIntegrationEditForm = ({
	editedConnectionName,
	googleIntegrationApplication,
}: IntegrationEditFormProps & { googleIntegrationApplication: GoogleIntegrationType }) => (
	<IntegrationEditForm
		editedConnectionName={editedConnectionName}
		integrationType={googleIntegrationApplication}
		schemas={{
			[ConnectionAuthType.Json]: googleJsonIntegrationSchema,
			[ConnectionAuthType.Oauth]: legacyOauthSchema,
		}}
		selectOptions={selectIntegrationGoogle}
	/>
);
