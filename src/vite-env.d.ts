/* eslint-disable unicorn/filename-case */
// / <reference types="vite/client" />
// / <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
	readonly DISPLAY_COMBOX_IN_TRIGGERS_FORM: boolean;
	readonly VITE_NODE_ENV: "development" | "production";
	readonly VITE_AUTH_ENABLED: string;
	readonly VITE_DESCOPE_PROJECT_ID: string;
	readonly TESTS_JWT_AUTH_TOKEN: string;
	readonly SENTRY_DSN: string;
	readonly VITE_HOST_URL: string;
	readonly DISPLAY_DISCORD_INTEGRATION: boolean;
	readonly DISPLAY_SLACK_SOCKET_INTEGRATION: boolean;
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
