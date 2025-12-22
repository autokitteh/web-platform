import React from "react";

import { selectIntegrationGoogle } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { IntegrationEditFormProps } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { googleCalendarIntegrationSchema, legacyOauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const GoogleCalendarIntegrationEditForm = ({ editedConnectionName }: IntegrationEditFormProps) => (
	<IntegrationEditForm
		editedConnectionName={editedConnectionName}
		integrationType={Integrations.calendar}
		schemas={{
			[ConnectionAuthType.Json]: googleCalendarIntegrationSchema,
			[ConnectionAuthType.Oauth]: legacyOauthSchema,
		}}
		selectOptions={selectIntegrationGoogle}
	/>
);
