import React from "react";

import { zoomIntegrationAuthMethods } from "@src/constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { zoomPrivateAuthIntegrationSchema, oauthSchema, zoomPrivateToServerIntegrationSchema } from "@validations";

import { IntegrationEditForm } from "@components/organisms/connections/integrations";

export const ZoomIntegrationEditForm = () => {
	return (
		<IntegrationEditForm
			integrationType={Integrations.zoom}
			schemas={{
				[ConnectionAuthType.OauthDefault]: oauthSchema,
				[ConnectionAuthType.OauthPrivate]: zoomPrivateAuthIntegrationSchema,
				[ConnectionAuthType.privateServerToServer]: zoomPrivateToServerIntegrationSchema,
			}}
			selectOptions={zoomIntegrationAuthMethods}
		/>
	);
};
