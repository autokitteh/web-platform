/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom",
		exclude: ["**/node_modules/**", "**/e2e/**", "**/dist/**"],
	},
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
});
