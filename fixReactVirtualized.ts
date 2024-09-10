/* eslint-disable security/detect-non-literal-fs-filename */
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type { PluginOption } from "vite";

export const reactVirtualized = (): PluginOption => {
	const wrongCode = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;

	return {
		name: "my:react-virtualized",
		async configResolved() {
			const reactVirtualizedPath = path.dirname(fileURLToPath(import.meta.resolve("react-virtualized")));

			const brokenFilePath = path.join(
				reactVirtualizedPath,
				"..",
				"es",
				"WindowScroller",
				"utils",
				"onScroll.js"
			);
			const brokenCode = await readFile(brokenFilePath, "utf-8");

			const fixedCode = brokenCode.replace(wrongCode, "");
			await writeFile(brokenFilePath, fixedCode);
		},
	};
};
