/* eslint-disable unicorn/filename-case */
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
	readonly VITE_HOST_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module "tailwind-config" {
	const config: Config;
	export default config;
}
