import { IProjectStore } from "@interfaces/store";
import { ProjectsService } from "@services";
import { readFileAsUint8Array } from "@utilities";
import i18n from "i18next";
import { debounce, isEmpty } from "lodash";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";

const defaultState: Omit<
	IProjectStore,
	| "loadProject"
	| "setUpdateFileContent"
	| "setProjectResources"
	| "getProjectResources"
	| "setProjectEmptyResources"
	| "setUpdateCount"
> = {
	projectId: undefined,
	resources: {},
	fileName: "",
	projectUpdateCount: 0,
};

const debouncedUpdateContent = debounce((set, fileName, content) => {
	const contentUintArray = new TextEncoder().encode(content);

	set((state: IProjectStore) => ({
		...state,
		resources: {
			...state.resources,
			[fileName]: contentUintArray,
		},
	}));
}, 1000);

const store: StateCreator<IProjectStore> = (set, get) => ({
	...defaultState,
	loadProject: async (projectId) => {
		set(() => ({
			...defaultState,
			projectId,
			resources: {},
		}));

		const { error } = await get().getProjectResources();

		return { error };
	},

	setUpdateCount: () => set((state) => ({ ...state, projectUpdateCount: state.projectUpdateCount + 1 })),

	setUpdateFileContent: (content) => {
		if (!get().fileName) return;

		debouncedUpdateContent(set, get().fileName, content);
	},

	setProjectResources: async (file) => {
		const fileContent = await readFileAsUint8Array(file);

		if (isEmpty(get().projectId)) return { error: { message: i18n.t("errors.projectIdNotFound") } };

		const { error } = await ProjectsService.setResources(get().projectId as string, {
			...get().resources,
			[file.name]: fileContent,
		});

		set((state) => ({
			...state,
			fileName: file.name,
			resources: {
				...state.resources,
				[file.name]: fileContent,
			},
		}));

		return { error };
	},

	setProjectEmptyResources: async (name) => {
		if (isEmpty(get().projectId)) return { error: { message: i18n.t("errors.projectIdNotFound") } };

		const { error } = await ProjectsService.setResources(get().projectId as string, {
			...get().resources,
			[name]: new Uint8Array(),
		});

		set((state) => ({
			...state,
			fileName: name,
			resources: {
				...state.resources,
				[name]: new Uint8Array(),
			},
		}));

		return { error };
	},

	getProjectResources: async () => {
		if (isEmpty(get().projectId)) return { error: { message: i18n.t("errors.projectIdNotFound") } };

		const { data, error } = await ProjectsService.getResources(get().projectId as string);

		set(() => ({ resources: data }));

		return { error };
	},
});

export const useProjectStore = create(persist(store, { name: "ProjectStore" }));
