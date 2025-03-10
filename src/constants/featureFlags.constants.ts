export const featureFlags = {
	displayDiscordIntegration: import.meta.env.DISPLAY_DISCORD_INTEGRATION,
	displaySlackSocketIntegration: import.meta.env.DISPLAY_SLACK_SOCKET_INTEGRATION,
	heightHideDefaultOAuth: import.meta.env.VITE_HEIGHT_HIDE_DEFAULT_OAUTH,
	linearHideDefaultOAuth: import.meta.env.VITE_LINEAR_HIDE_DEFAULT_OAUTH,
	zoomHideDefaultOAuth: import.meta.env.VITE_ZOOM_HIDE_DEFAULT_OAUTH,
	hideMicrosoftIntegration: import.meta.env.VITE_MICROSOFT_HIDE_INTEGRATION,
};
