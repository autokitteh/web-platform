import React from "react";

import { selectIntegrationGoogle } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { googleIntegrationSchema, oauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations";

export const GoogleIntegrationEditForm = ({
	googleIntegrationApplication,
}: {
	googleIntegrationApplication: string;
}) => (
	<IntegrationEditForm
		googleIntegrationApplication={googleIntegrationApplication}
		integrationType={Integrations.google}
		schemas={{
			[ConnectionAuthType.JsonKey]: googleIntegrationSchema,
			[ConnectionAuthType.Oauth]: oauthSchema,
		}}
		selectOptions={selectIntegrationGoogle}
	/>
);
