import React from "react";

import { selectIntegrationGoogle } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { googleIntegrationSchema, oauthSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const GoogleYoutubeIntegrationEditForm = () => (
	<IntegrationEditForm
		integrationType={Integrations.youtube}
		schemas={{
			[ConnectionAuthType.JsonKey]: googleIntegrationSchema,
			[ConnectionAuthType.Oauth]: oauthSchema,
		}}
		selectOptions={selectIntegrationGoogle}
	/>
);
