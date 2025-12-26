import { ServiceResponse } from "@src/types";

export interface BuildFilesData {
	files: Record<string, string[]>;
	buildId: string;
}

export interface BuildFilesStore {
	projectBuildFiles: {
		[projectId: string]: BuildFilesData;
	};
	fetchBuildFiles: (projectId: string, buildId: string, force?: boolean) => ServiceResponse<Record<string, string[]>>;
	getBuildFiles: (projectId: string) => Record<string, string[]> | undefined;
	clearBuildFiles: (projectId: string) => void;
}
