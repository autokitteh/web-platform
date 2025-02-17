export const featureFlags = {
	displayDiscordIntegration: import.meta.env.DISPLAY_DISCORD_INTEGRATION,
	displaySlackSocketIntegration: import.meta.env.DISPLAY_SLACK_SOCKET_INTEGRATION,
	linearConnectionEnabled: import.meta.env.VITE_LINEAR_ENABLED,
	zoomConnectionEnabled: import.meta.env.VITE_ZOOM_ENABLED,
	heightDisplayDefaultOAuth: import.meta.env.VITE_HEIGHT_DISPLAY_DEFAULT_OAUTH,
	heightConnectionEnabled: import.meta.env.VITE_HEIGHT_ENABLED,
	linearDisplayDefaultOAuth: import.meta.env.VITE_LINEAR_DISPLAY_DEFAULT_OAUTH,
};
