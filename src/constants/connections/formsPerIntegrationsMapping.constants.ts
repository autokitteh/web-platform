import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";

import { OauthForm, PatForm } from "@components/organisms/connections/integrations/github/authMethods";
import { OauthForm as SlackOauth, SocketForm } from "@components/organisms/connections/integrations/slack/authMethods";

export const formsPerIntegrationsMapping: Partial<
	Record<Integrations, Partial<Record<ConnectionAuthType, React.ComponentType<any>>>>
> = {
	[Integrations.github]: {
		[ConnectionAuthType.Pat]: PatForm,
		[ConnectionAuthType.Oauth]: OauthForm,
	},
	[Integrations.slack]: {
		[ConnectionAuthType.Socket]: SocketForm,
		[ConnectionAuthType.Oauth]: SlackOauth,
	},
};
