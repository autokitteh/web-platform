import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";

import { OauthForm, PatForm } from "@components/organisms/connections/integrations/github/authMethods";
import {
	OauthForm as SlackOauthForm,
	SocketForm,
} from "@components/organisms/connections/integrations/slack/authMethods";
import {
	ApiKeyTwilioForm,
	AuthTokenTwilioForm,
} from "@components/organisms/connections/integrations/twilio/authMethods";

export const formsPerIntegrationsMapping: Partial<
	Record<Integrations, Partial<Record<ConnectionAuthType, React.ComponentType<any>>>>
> = {
	[Integrations.github]: {
		[ConnectionAuthType.Pat]: PatForm,
		[ConnectionAuthType.Oauth]: OauthForm,
	},
	[Integrations.slack]: {
		[ConnectionAuthType.Socket]: SocketForm,
		[ConnectionAuthType.Oauth]: SlackOauthForm,
	},
	[Integrations.twilio]: {
		[ConnectionAuthType.ApiKey]: ApiKeyTwilioForm,
		[ConnectionAuthType.AuthToken]: AuthTokenTwilioForm,
	},
};
