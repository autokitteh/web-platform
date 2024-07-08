/* eslint-disable unicorn/filename-case */
// / <reference types="vite/client" />
// / <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
	readonly NODE_ENV: "development" | "production";
	readonly VITE_AUTH_ENABLED: string;
	readonly VITE_DESCOPE_PROJECT_ID: string;
	readonly VITE_HOST_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module "tailwind-config" {
	const config: Config;
	export default config;
}
