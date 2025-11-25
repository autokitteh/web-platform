const getEnv = (key: string) => {
	if (typeof import.meta !== "undefined" && import.meta.env) {
		const env = import.meta.env as unknown as Record<string, string | undefined>;
		return env[key];
	}
	if (typeof process !== "undefined" && process.env) {
		return process.env[key];
	}
	return undefined;
};

const getFlag = (key: string) => {
	const value = getEnv(key);

	if (value === undefined) {
		return false;
	}

	return String(value).toLowerCase() === "true" || value === "1";
};

export const featureFlags = {
	displaySlackSocketIntegration: getFlag("DISPLAY_SLACK_SOCKET_INTEGRATION"),
	linearHideDefaultOAuth: getFlag("VITE_LINEAR_HIDE_DEFAULT_OAUTH"),
	salesforceHideDefaultOAuth: getFlag("VITE_SALESFORCE_HIDE_DEFAULT_OAUTH"),
	zoomHideDefaultOAuth: getFlag("VITE_ZOOM_HIDE_DEFAULT_OAUTH"),
	microsoftHideDefaultOAuth: getFlag("VITE_MICROSOFT_HIDE_INTEGRATION"),
	notionHideDefaultOAuth: getFlag("VITE_NOTION_HIDE_DEFAULT_OAUTH"),
	telegramHideIntegration: getFlag("VITE_HIDE_TELEGRAM_CONN"),
	pipedriveHideIntegration: getFlag("VITE_PIPEDRIVE_HIDE_INTEGRATION"),
	sendDotEmptyTriggerFilter: getFlag("VITE_SEND_DOT_EMPTY_TRIGGER_FILTER"),
	displayChatbot: getFlag("VITE_DISPLAY_CHATBOT"),
	displayBilling: getFlag("VITE_DISPLAY_BILLING"),
};
