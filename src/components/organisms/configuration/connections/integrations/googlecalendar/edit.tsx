import React from "react";

import { selectIntegrationGoogle } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { googleCalendarIntegrationSchema, legacyOauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const GoogleCalendarIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.calendar}
		schemas={{
			[ConnectionAuthType.Json]: googleCalendarIntegrationSchema,
			[ConnectionAuthType.Oauth]: legacyOauthSchema,
		}}
		selectOptions={selectIntegrationGoogle}
	/>
);
