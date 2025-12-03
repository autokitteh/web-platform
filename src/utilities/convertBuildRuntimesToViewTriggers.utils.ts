import { unique } from "radash";

import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { BuildInfoRuntimes } from "@type/models";

const processRuntime = (runtime: BuildInfoRuntimes): Record<string, string[]> => {
	const result: Record<string, string[]> = {};
	const fileNames = Object.keys(runtime.artifact.compiled_data).filter((fileName) => fileName !== "archive");

	fileNames.forEach((fileName) => {
		if (fileName.startsWith("_") || fileName === "code.tar") {
			return;
		}
		const entrypointsForFile = (runtime?.artifact?.exports || [])
			.filter(({ location: { path }, symbol: name }) => path === fileName && !name.startsWith("_"))
			.map(({ symbol: name }) => name);

		const uniqueEntrypoints = unique(entrypointsForFile, (func) => func);

		result[fileName] = uniqueEntrypoints;
	});

	return result;
};

export const convertBuildRuntimesToViewTriggers = (runtimes: BuildInfoRuntimes[]): Record<string, string[]> => {
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
