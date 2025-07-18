export const featureFlags = {
	displayDiscordIntegration: import.meta.env.DISPLAY_DISCORD_INTEGRATION,
	displaySlackSocketIntegration: import.meta.env.DISPLAY_SLACK_SOCKET_INTEGRATION,
	heightHideDefaultOAuth: import.meta.env.VITE_HEIGHT_HIDE_DEFAULT_OAUTH,
	linearHideDefaultOAuth: import.meta.env.VITE_LINEAR_HIDE_DEFAULT_OAUTH,
	salesforceHideDefaultOAuth: import.meta.env.VITE_SALESFORCE_HIDE_DEFAULT_OAUTH,
	zoomHideDefaultOAuth: import.meta.env.VITE_ZOOM_HIDE_DEFAULT_OAUTH,
	microsoftHideIntegration: import.meta.env.VITE_MICROSOFT_HIDE_INTEGRATION,
	sendDotEmptyTriggerFilter: import.meta.env.VITE_SEND_DOT_EMPTY_TRIGGER_FILTER,
	displayChatbot: import.meta.env.VITE_DISPLAY_CHATBOT,
	displayBilling: import.meta.env.VITE_DISPLAY_BILLING,
};
