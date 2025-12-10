import React from "react";

import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { twilioApiKeyIntegrationSchema, twilioTokenIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const TwilioIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.twilio}
		schemas={{
			[ConnectionAuthType.ApiKey]: twilioApiKeyIntegrationSchema,
			[ConnectionAuthType.AuthToken]: twilioTokenIntegrationSchema,
		}}
	/>
);
