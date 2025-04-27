import { BuildRuntimeExport } from "@interfaces/models/session.interface";

export type BuildInfoRuntimes = {
	artifact: {
		compiled_data: string;
		exports: BuildRuntimeExport[];
	};
	info: {
		name: string;
	};
};
