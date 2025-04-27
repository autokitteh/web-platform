import React from "react";

import { zoomIntegrationAuthMethods } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@enums/components";
import { zoomPrivateAuthIntegrationSchema, oauthSchema, zoomServerToServerIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations";

export const ZoomIntegrationEditForm = () => {
	return (
		<IntegrationEditForm
			integrationType={Integrations.zoom}
			schemas={{
				[ConnectionAuthType.OauthDefault]: oauthSchema,
				[ConnectionAuthType.OauthPrivate]: zoomPrivateAuthIntegrationSchema,
				[ConnectionAuthType.serverToServer]: zoomServerToServerIntegrationSchema,
			}}
			selectOptions={zoomIntegrationAuthMethods}
		/>
	);
};
