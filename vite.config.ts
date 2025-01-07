import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "vite";
import { ViteEjsPlugin } from "vite-plugin-ejs";
import { viteStaticCopy } from "vite-plugin-static-copy";
import svgr from "vite-plugin-svgr";

import { reactVirtualized } from "./fixReactVirtualized";

dotenv.config();

export default defineConfig({
	preview: {
		port: 8000,
	},
	build: {
		sourcemap: true,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules") && !id.includes("node_modules/@sentry")) {
						return id.toString().split("node_modules/")[1].split("/")[0].toString();
					}
				},
			},
		},
		minify: "terser",
		terserOptions: {
			compress: {
				dead_code: true,
				if_return: true,
				unused: true,
				reduce_vars: true,
				reduce_funcs: true,
				passes: 2,
			},
		},
	},
	define: {
		"import.meta.env.VITE_NODE_ENV": JSON.stringify(process.env.VITE_NODE_ENV),
		"import.meta.env.VITE_DESCOPE_PROJECT_ID": JSON.stringify(process.env.VITE_DESCOPE_PROJECT_ID),
		"import.meta.env.GOOGLE_ANALYTICS_ID": JSON.stringify(process.env.GOOGLE_ANALYTICS_ID),
		"import.meta.env.VITE_HOST_URL": JSON.stringify(process.env.VITE_HOST_URL),
		"import.meta.env.DISPLAY_DISCORD_INTEGRATION": process.env.DISPLAY_DISCORD_INTEGRATION,
		"import.meta.env.DISPLAY_SLACK_SOCKET_INTEGRATION": process.env.DISPLAY_SLACK_SOCKET_INTEGRATION,
		"import.meta.env.SENTRY_DSN": JSON.stringify(process.env.SENTRY_DSN),
		"import.meta.env.TESTS_JWT_AUTH_TOKEN": JSON.stringify(process.env.TESTS_JWT_AUTH_TOKEN),
		"import.meta.env.ENABLE_NEW_ORGS_AND_USERS_DESIGN": process.env.ENABLE_NEW_ORGS_AND_USERS_DESIGN,
		"import.meta.env.VITE_GTM_ID": JSON.stringify(process.env.VITE_GTM_ID),
	},
	optimizeDeps: {
		include: ["tailwind-config"],
	},
	plugins: [
		react(),
		ViteEjsPlugin((viteConfig) => ({
			env: viteConfig.env,
		})),
		svgr({
			svgrOptions: {
				ref: true,
				icon: false,
				replaceAttrValues: {
					"#000": "currentColor",
				},
				svgoConfig: {
					multipass: true,
					plugins: [
						{
							name: "preset-default",
							params: {
								overrides: {
									removeViewBox: false,
									cleanupIDs: false,
									removeUselessStrokeAndFill: false,
									removeUnknownsAndDefaults: false,
									convertPathData: {
										floatPrecision: 2,
										transformPrecision: 4,
									},
									cleanupNumericValues: {
										floatPrecision: 2,
									},
									collapseGroups: true,
									mergePaths: true,
									convertTransform: true,
									convertShapeToPath: true,
									removeEmptyAttrs: true,
									removeEmptyContainers: true,
									removeUnusedNS: true,
									sortAttrs: true,
								},
							},
						},
					],
				},
			},
		}),
		viteStaticCopy({
			targets: [
				{
					src: "src/assets/templates/**/*",
					dest: "assets/templates",
				},
				{
					src: "src/assets/new_project_program/**/*",
					dest: "assets/new_project_program",
				},
				{
					src: "src/assets/image/pages/**/*",
					dest: "assets/image/pages",
				},
			],
		}),
		reactVirtualized(),
	],
	resolve: {
		alias: {
			"@src": path.resolve(__dirname, "./src"),
			"@ak-proto-ts": path.resolve(__dirname, "./src/autokitteh/proto/gen/ts/autokitteh"),
			"@api": path.resolve(__dirname, "./src/api"),
			"@assets": path.resolve(__dirname, "./src/assets"),
			"@components": path.resolve(__dirname, "./src/components"),
			"@contexts": path.resolve(__dirname, "./src/contexts"),
			"@constants": path.resolve(__dirname, "./src/constants"),
			"@enums": path.resolve(__dirname, "./src/enums"),
			"@hooks": path.resolve(__dirname, "./src/hooks"),
			"@i18n": path.resolve(__dirname, "./src/i18n"),
			"@interfaces": path.resolve(__dirname, "./src/interfaces"),
			"@locales": path.resolve(__dirname, "./src/locales"),
			"@models": path.resolve(__dirname, "./src/models"),
			"@pages": path.resolve(__dirname, "./pages"),
			"@routing": path.resolve(__dirname, "./src/routing"),
			"@services": path.resolve(__dirname, "./src/services"),
			"@store": path.resolve(__dirname, "./src/store"),
			"@type": path.resolve(__dirname, "./src/types"),
			"@utilities": path.resolve(__dirname, "./src/utilities"),
			"@utils": path.resolve(__dirname, "./src/utils"),
			"@validations": path.resolve(__dirname, "./src/validations"),
			"tailwind-config": path.resolve(__dirname, "./tailwind.config.cjs"),
		},
	},
	server: {
		host: true,
		origin: process.env.VITE_DOMAIN_URL,
		port: 8000,
		strictPort: true,
	},
});
