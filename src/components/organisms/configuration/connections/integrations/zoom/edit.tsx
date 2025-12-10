import React from "react";

import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { zoomPrivateAuthIntegrationSchema, legacyOauthSchema, zoomServerToServerIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/configuration/connections/integrations";

export const ZoomIntegrationEditForm = () => {
	return (
		<IntegrationEditForm
			integrationType={Integrations.zoom}
			schemas={{
				[ConnectionAuthType.OauthDefault]: legacyOauthSchema,
				[ConnectionAuthType.OauthPrivate]: zoomPrivateAuthIntegrationSchema,
				[ConnectionAuthType.serverToServer]: zoomServerToServerIntegrationSchema,
			}}
		/>
	);
};
