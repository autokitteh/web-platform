import { uniqBy } from "lodash";

import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { BuildInfoRuntimes, SessionEntrypoint } from "@type/models";

const processRuntime = (runtime: BuildInfoRuntimes): Record<string, SessionEntrypoint[]> => {
	const result: Record<string, SessionEntrypoint[]> = {};
	const fileNames = Object.keys(runtime.artifact.compiled_data)?.filter((fileName) => fileName !== "archive");

	fileNames?.forEach((fileName) => {
		const entrypointsForFile = runtime.artifact.exports
			?.filter(({ location: { path }, symbol: name }) => path === fileName && !name.startsWith("_"))
			.map(({ location: { col, path, row }, symbol: name }) => ({
				path,
				row,
				col,
				name,
			}));

		const uniqueEntrypoints = uniqBy(
			entrypointsForFile,
			({ col, name, path, row }) => `${path}:${row}:${col}:${name}`
		);

		result[fileName] = uniqueEntrypoints;
	});

	return result;
};

export const convertBuildRuntimesToViewTriggers = (
	runtimes: BuildInfoRuntimes[]
): Record<string, SessionEntrypoint[]> => {
	try {
		const supportedRuntimes = ["python", "starlark"];

		const runtime = runtimes.find((runtime) => supportedRuntimes.includes(runtime.info.name));

		if (runtime) {
			return processRuntime(runtime);
		}
	} catch (error) {
		LoggerService.error(namespaces.buildRuntimeEntrypoints, (error as Error).message);

		return {};
	}

	return {};
};