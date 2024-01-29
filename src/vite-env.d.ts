/* eslint-disable unicorn/filename-case */
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
	readonly BASE_API_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
