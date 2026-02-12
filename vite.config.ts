import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import { ViteEjsPlugin } from "vite-plugin-ejs";
import mkcert from "vite-plugin-mkcert";
import { viteStaticCopy } from "vite-plugin-static-copy";
import svgr from "vite-plugin-svgr";

import { reactVirtualized } from "./fixReactVirtualized";
import { securedDomainConfigured, mkcertConfig } from "./mkcert.util";

dotenv.config();

const packageJsonPath = new URL("package.json", import.meta.url).pathname;
// eslint-disable-next-line security/detect-non-literal-fs-filename
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const version = packageJson.version;

export default defineConfig({
	root: __dirname,
	cacheDir: path.resolve(__dirname, "node_modules/.vite"),
	publicDir: path.resolve(__dirname, "public"),
	clearScreen: false,
	preview: {
		port: process.env.VITE_PREVIEW_PORT
			? parseInt(process.env.VITE_PREVIEW_PORT)
			: process.env.VITE_LOCAL_PORT
				? parseInt(process.env.VITE_LOCAL_PORT)
				: 8000,
	},
	build: {
		sourcemap: true,
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
		"import.meta.env.VITE_APP_VERSION": JSON.stringify(version),
		"import.meta.env.VITE_NODE_ENV": JSON.stringify(process.env.VITE_NODE_ENV),
		"import.meta.env.VITE_DESCOPE_PROJECT_ID": JSON.stringify(process.env.VITE_DESCOPE_PROJECT_ID),
		"import.meta.env.GOOGLE_ANALYTICS_ID": JSON.stringify(process.env.GOOGLE_ANALYTICS_ID),
		"import.meta.env.VITE_HOST_URL": JSON.stringify(process.env.VITE_HOST_URL),
		"import.meta.env.DISPLAY_SLACK_SOCKET_INTEGRATION": process.env.DISPLAY_SLACK_SOCKET_INTEGRATION,
		"import.meta.env.TESTS_JWT_AUTH_TOKEN": JSON.stringify(process.env.TESTS_JWT_AUTH_TOKEN),
		"import.meta.env.VITE_GTM_ID": JSON.stringify(process.env.VITE_GTM_ID),
		"import.meta.env.VITE_LUCKY_ORANGE_ID": JSON.stringify(process.env.VITE_LUCKY_ORANGE_ID),
		"import.meta.env.VITE_HUBSPOT_PORTAL_ID": JSON.stringify(process.env.VITE_HUBSPOT_PORTAL_ID),
		"import.meta.env.VITE_HUBSPOT_FORM_ID": JSON.stringify(process.env.VITE_HUBSPOT_FORM_ID),
		"import.meta.env.VITE_LINEAR_HIDE_DEFAULT_OAUTH": process.env.VITE_LINEAR_HIDE_DEFAULT_OAUTH,
		"import.meta.env.VITE_ZOOM_HIDE_DEFAULT_OAUTH": process.env.VITE_ZOOM_HIDE_DEFAULT_OAUTH,
		"import.meta.env.VITE_MICROSOFT_HIDE_INTEGRATION": process.env.VITE_MICROSOFT_HIDE_INTEGRATION,
		"import.meta.env.VITE_NOTION_HIDE_DEFAULT_OAUTH": process.env.VITE_NOTION_HIDE_DEFAULT_OAUTH,
		"import.meta.env.VITE_HIDE_TELEGRAM_CONN": process.env.VITE_HIDE_TELEGRAM_CONN,
		"import.meta.env.VITE_SEND_DOT_EMPTY_TRIGGER_FILTER": process.env.VITE_SEND_DOT_EMPTY_TRIGGER_FILTER,
		"import.meta.env.VITE_SALESFORCE_HIDE_DEFAULT_OAUTH": process.env.VITE_SALESFORCE_HIDE_DEFAULT_OAUTH,
		"import.meta.env.VITE_DISPLAY_CHATBOT": process.env.VITE_DISPLAY_CHATBOT,
		"import.meta.env.VITE_AKBOT_URL": JSON.stringify(process.env.VITE_AKBOT_URL),
		"import.meta.env.VITE_CI_CD": JSON.stringify(process.env?.CI || "false").toLowerCase() === "true",
		"import.meta.env.VITE_RUN_VISUAL_REGRESSION_TESTS":
			JSON.stringify(process.env?.VITE_RUN_VISUAL_REGRESSION_TESTS || "false").toLowerCase() === "true",
		"import.meta.env.VITE_SUPPORT_EMAIL": JSON.stringify(process.env.VITE_SUPPORT_EMAIL),
		"import.meta.env.VITE_AKBOT_ORIGIN": JSON.stringify(process.env.VITE_AKBOT_ORIGIN),
		"import.meta.env.VITE_DISPLAY_BILLING": Boolean(JSON.stringify(process.env.VITE_DISPLAY_BILLING)),
		"import.meta.env.VITE_HIDE_ORG_CONNECTIONS": process.env.VITE_HIDE_ORG_CONNECTIONS,
		"import.meta.env.VITE_SALES_EMAIL": JSON.stringify(process.env.VITE_SALES_EMAIL),
		"import.meta.env.VITE_DATADOG_APPLICATION_ID": JSON.stringify(process.env.VITE_DATADOG_APPLICATION_ID),
		"import.meta.env.VITE_DATADOG_CLIENT_TOKEN": JSON.stringify(process.env.VITE_DATADOG_CLIENT_TOKEN),
		"import.meta.env.VITE_DATADOG_SITE": JSON.stringify(process.env.VITE_DATADOG_SITE),
		"import.meta.env.VITE_DATADOG_SERVICE": JSON.stringify(process.env.VITE_DATADOG_SERVICE),
		"import.meta.env.VITE_DATADOG_ENV": JSON.stringify(process.env.VITE_DATADOG_ENV),
		"import.meta.env.VITE_FEEDBACK_WEBHOOK_URL": JSON.stringify(process.env.VITE_FEEDBACK_WEBHOOK_URL),
	},
	optimizeDeps: {
		include: ["tailwind-config", "apexcharts"],
	},
	plugins: [
		react(),
		...(securedDomainConfigured ? [mkcert(mkcertConfig)] : []),
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
			"@shared-components": path.resolve(__dirname, "./src/components/organisms/shared"),
			"@contexts": path.resolve(__dirname, "./src/contexts"),
			"@constants": path.resolve(__dirname, "./src/constants"),
			"@factories": path.resolve(__dirname, "./src/factories"),
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
		host: process.env.VITE_APP_DOMAIN ? "0.0.0.0" : true,
		port: process.env.VITE_LOCAL_PORT ? Number(process.env.VITE_LOCAL_PORT) : 8000,
		strictPort: true,
	},
});
