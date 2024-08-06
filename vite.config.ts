import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import svgr from "vite-plugin-svgr";

dotenv.config();

export default defineConfig({
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules") && !id.includes("node_modules/@sentry")) {
						return id.toString().split("node_modules/")[1].split("/")[0].toString();
					}
				},
			},
		},
	},
	define: {
		"import.meta.env.VITE_NODE_ENV": JSON.stringify(process.env.VITE_NODE_ENV),
		"import.meta.env.VITE_AUTH_ENABLED": JSON.stringify(process.env.VITE_AUTH_ENABLED),
		"import.meta.env.VITE_DESCOPE_PROJECT_ID": JSON.stringify(process.env.VITE_DESCOPE_PROJECT_ID),
		"import.meta.env.VITE_HOST_URL": JSON.stringify(process.env.VITE_HOST_URL),
		"import.meta.env.VITE_BASE_URL": JSON.stringify(process.env.VITE_BASE_URL),
		"import.meta.env.SENTRY_AUTH_TOKEN": JSON.stringify(process.env.SENTRY_AUTH_TOKEN),
		"import.meta.env.SENTRY_DSN": JSON.stringify(process.env.SENTRY_DSN),
		"import.meta.env.VITE_AUTH_BEARER_TOKEN": JSON.stringify(process.env.VITE_AUTH_BEARER_TOKEN),
	},
	optimizeDeps: {
		include: ["tailwind-config"],
	},
	plugins: [
		react(),
		svgr({ svgrOptions: { ref: true } }),
		sentryVitePlugin({
			org: "autokitteh",
			project: "web-ui",
			reactComponentAnnotation: { enabled: true },
			authToken: process.env.SENTRY_AUTH_TOKEN,
		}),
		viteStaticCopy({
			targets: [
				{
					src: "src/assets/templates/**/*",
					dest: "assets/templates",
				},
			],
		}),
	],
	resolve: {
		alias: {
			"@src": path.resolve(__dirname, "./src"),
			"@ak-proto-ts": path.resolve(__dirname, "./src/autokitteh/proto/gen/ts/autokitteh"),
			"@api": path.resolve(__dirname, "./src/api"),
			"@assets": path.resolve(__dirname, "./src/assets"),
			"@components": path.resolve(__dirname, "./src/components"),
			"@constants": path.resolve(__dirname, "./src/constants"),
			"@e2e": path.resolve(__dirname, "./e2e"),
			"@enums": path.resolve(__dirname, "./src/enums"),
			"@hooks": path.resolve(__dirname, "./src/hooks"),
			"@i18n": path.resolve(__dirname, "./src/i18n"),
			"@interfaces": path.resolve(__dirname, "./src/interfaces"),
			"@locales": path.resolve(__dirname, "./src/locales"),
			"@models": path.resolve(__dirname, "./src/models"),
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
