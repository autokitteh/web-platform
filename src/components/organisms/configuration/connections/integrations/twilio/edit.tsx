import React from "react";

import { selectIntegrationTwilio } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { IntegrationEditFormProps } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { twilioApiKeyIntegrationSchema, twilioTokenIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const TwilioIntegrationEditForm = ({ editedConnectionName }: IntegrationEditFormProps) => (
	<IntegrationEditForm
		editedConnectionName={editedConnectionName}
		integrationType={Integrations.twilio}
		schemas={{
			[ConnectionAuthType.ApiKey]: twilioApiKeyIntegrationSchema,
			[ConnectionAuthType.AuthToken]: twilioTokenIntegrationSchema,
		}}
		selectOptions={selectIntegrationTwilio}
	/>
);
