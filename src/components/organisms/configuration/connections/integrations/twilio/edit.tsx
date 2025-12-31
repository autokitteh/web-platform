import React from "react";

import { selectIntegrationTwilio } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { twilioApiTokenIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const TwilioIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.twilio}
		schemas={{
			[ConnectionAuthType.ApiToken]: twilioApiTokenIntegrationSchema,
		}}
		selectOptions={selectIntegrationTwilio}
	/>
);
