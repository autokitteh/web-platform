import React from "react";

import { selectIntegrationTwilio } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@enums/components";
import { twilioApiKeyIntegrationSchema, twilioTokenIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations";

export const TwilioIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.twilio}
		schemas={{
			[ConnectionAuthType.ApiKey]: twilioApiKeyIntegrationSchema,
			[ConnectionAuthType.AuthToken]: twilioTokenIntegrationSchema,
		}}
		selectOptions={selectIntegrationTwilio}
	/>
);
