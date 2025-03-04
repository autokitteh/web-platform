/* eslint-disable unicorn/filename-case */
// / <reference types="vite/client" />
// / <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
	readonly VITE_NODE_ENV: "development" | "production";
	readonly VITE_DESCOPE_PROJECT_ID: string;
	readonly GOOGLE_ANALYTICS_ID: string;
	readonly TESTS_JWT_AUTH_TOKEN: string;
	readonly SENTRY_DSN: string;
	readonly VITE_HOST_URL: string;
	readonly DISPLAY_DISCORD_INTEGRATION: boolean;
	readonly DISPLAY_SLACK_SOCKET_INTEGRATION: boolean;
	readonly VITE_GTM_ID: string;
	readonly VITE_LUCKY_ORANGE_ID: string;
	readonly VITE_HUBSPOT_PORTAL_ID: string;
	readonly VITE_HUBSPOT_FORM_ID: string;
	readonly VITE_HEIGHT_HIDE_DEFAULT_OAUTH: boolean;
	readonly VITE_LINEAR_HIDE_DEFAULT_OAUTH: boolean;
	readonly VITE_ZOOM_HIDE_DEFAULT_OAUTH: boolean;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module "tailwind-config" {
	const config: Config;
	export default config;
}

declare module "*.yaml" {
	const content: string;
	export default content;
}
