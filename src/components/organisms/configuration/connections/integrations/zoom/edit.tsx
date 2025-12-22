import React from "react";

import { IntegrationEditFormProps } from "@interfaces/components";
import { zoomIntegrationAuthMethods } from "@src/constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { zoomPrivateAuthIntegrationSchema, legacyOauthSchema, zoomServerToServerIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const ZoomIntegrationEditForm = ({ editedConnectionName }: IntegrationEditFormProps) => (
	<IntegrationEditForm
		editedConnectionName={editedConnectionName}
		integrationType={Integrations.zoom}
		schemas={{
			[ConnectionAuthType.OauthDefault]: legacyOauthSchema,
			[ConnectionAuthType.OauthPrivate]: zoomPrivateAuthIntegrationSchema,
			[ConnectionAuthType.serverToServer]: zoomServerToServerIntegrationSchema,
		}}
		selectOptions={zoomIntegrationAuthMethods}
	/>
);
