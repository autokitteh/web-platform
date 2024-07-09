import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import path from "path";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vitest/config";

dotenv.config();

export default defineConfig({
	define: {
		"process.env": {},
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
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
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
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./setupTests.ts"],
	},
});
