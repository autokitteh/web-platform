import path from "path";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vitest/config";

export default defineConfig({
	optimizeDeps: {
		include: ["tailwind-config"],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@assets": path.resolve(__dirname, "./src/assets"),
			"@e2e": path.resolve(__dirname, "./e2e"),
			"@components": path.resolve(__dirname, "./src/components"),
			"@api": path.resolve(__dirname, "./src/api"),
			"@utils": path.resolve(__dirname, "./src/utils"),
			"@validations": path.resolve(__dirname, "./src/validations"),
			"@routing": path.resolve(__dirname, "./src/routing"),
			"@services": path.resolve(__dirname, "./src/services"),
			"@enums": path.resolve(__dirname, "./src/enums"),
			"@constants": path.resolve(__dirname, "./src/constants"),
			"@models": path.resolve(__dirname, "./src/models"),
			"@utilities": path.resolve(__dirname, "./src/utilities"),
			"@i18n": path.resolve(__dirname, "./src/i18n"),
			"@type": path.resolve(__dirname, "./src/types"),
			"@interfaces": path.resolve(__dirname, "./src/interfaces"),
			"@store": path.resolve(__dirname, "./src/store"),
			"@locales": path.resolve(__dirname, "./src/locales"),
			"@ak-proto-ts": path.resolve(__dirname, "./src/autokitteh/proto/gen/ts/autokitteh"),
			"tailwind-config": path.resolve(__dirname, "./tailwind.config.cjs"),
		},
	},
	plugins: [react(), svgr({ svgrOptions: { ref: true } })],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./setupTests.ts"],
	},
	define: {
		"process.env": {},
	},
	server: {
		port: 8000,
		strictPort: true,
		host: true,
		origin: "http://0.0.0.0:8000",
	},
});
