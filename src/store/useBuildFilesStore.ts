import { StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { BuildsService } from "@services";
import { BuildFilesStore } from "@src/interfaces/store";
import { convertBuildRuntimesToViewTriggers } from "@src/utilities";

const store: StateCreator<BuildFilesStore> = (set, get) => ({
	projectBuildFiles: {},

	fetchBuildFiles: async (projectId, buildId, force = false) => {
		const currentData = get().projectBuildFiles[projectId];

		if (!force && currentData?.buildId === buildId && Object.keys(currentData.files).length > 0) {
			return { data: currentData.files, error: undefined };
		}

		const { data: buildDescription, error: buildDescriptionError } =
			await BuildsService.getBuildDescription(buildId);

		if (buildDescriptionError || !buildDescription) {
			return { data: undefined, error: buildDescriptionError };
		}

		try {
			const buildInfo = JSON.parse(buildDescription);
			const files = convertBuildRuntimesToViewTriggers(buildInfo.runtimes);

			set((state) => {
				state.projectBuildFiles[projectId] = {
					files,
					buildId,
				};
				return state;
			});

			return { data: files, error: undefined };
		} catch (error) {
			return { data: undefined, error };
		}
	},

	getBuildFiles: (projectId) => {
		return get().projectBuildFiles[projectId]?.files;
	},

	clearBuildFiles: (projectId) => {
		set((state) => {
			delete state.projectBuildFiles[projectId];
			return state;
		});
	},
});

export const useBuildFilesStore = create(immer(store), shallow);
