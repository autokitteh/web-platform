import { PushParams } from "@src/types/hooks";

export interface HubSpotConfig {
	readonly PORTAL_ID: string;
	readonly SCRIPT_URL: string;
	readonly TIMEOUT_MS: number;
	readonly COMPONENT_TAG: string;
}

export interface HubSpotQueue extends Array<PushParams> {
	loaded?: boolean;
}

export interface HubSpotConversations {
	widget?: {
		load?: () => void;
		remove?: () => void;
	};
}
