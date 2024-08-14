import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";

import { OauthForm, PatForm } from "@components/organisms/connections/integrations/github/authMethods";
import { JsonKeyGoogleForm, OauthGoogleForm } from "@components/organisms/connections/integrations/google";

export const formsPerIntegrationsMapping: Partial<
	Record<Integrations, Partial<Record<ConnectionAuthType, React.ComponentType<any>>>>
> = {
	[Integrations.github]: {
		[ConnectionAuthType.Pat]: PatForm,
		[ConnectionAuthType.Oauth]: OauthForm,
	},
	[Integrations.google]: {
		[ConnectionAuthType.ServiceAccount]: JsonKeyGoogleForm,
		[ConnectionAuthType.Oauth]: OauthGoogleForm,
	},
};
