import React from "react";

import { selectIntegrationTwilio } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { twilioApiKeyIntegrationSchema, twilioTokenIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const TwilioIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.twilio}
		schemas={{
			[ConnectionAuthType.ApiKey]: twilioApiKeyIntegrationSchema,
			[ConnectionAuthType.ApiToken]: twilioTokenIntegrationSchema, // Changed from AuthToken to ApiToken
		}}
		selectOptions={selectIntegrationTwilio}
	/>
);
