/* eslint-disable unicorn/filename-case */
// / <reference types="vite/client" />
// / <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
	readonly VITE_NODE_ENV: "development" | "production";
	readonly VITE_AUTH_ENABLED: string;
	readonly VITE_DESCOPE_PROJECT_ID: string;
	readonly TESTS_JWT_AUTH_TOKEN: string;
	readonly VITE_BASE_URL: string;
	readonly VITE_SENTRY_AUTH_TOKEN: string;
	readonly VITE_SENTRY_DSN: string;
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
