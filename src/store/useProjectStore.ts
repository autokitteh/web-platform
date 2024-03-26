import { EStoreName } from "@enums";
import { IProjectStore } from "@interfaces/store";
import { ProjectsService } from "@services";
import { readFileAsUint8Array } from "@utilities";
import i18n from "i18next";
import { isEmpty } from "lodash";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const defaultState: Omit<
	IProjectStore,
	| "loadProject"
	| "setUpdateFileContent"
	| "setProjectResources"
	| "getProjectResources"
	| "setProjectEmptyResources"
	| "setActiveTab"
	| "getProjectsList"
> = {
	list: [],
	currentProject: {
		projectId: undefined,
		activeEditorFileName: "",
		resources: {},
	},
	activeTab: 1,
};

const store: StateCreator<IProjectStore> = (set, get) => ({
	...defaultState,
	loadProject: async (projectId) => {
		if (get().currentProject.projectId === projectId) return { error: undefined };

		set(() => ({
			...defaultState,
			currentProject: { ...defaultState.currentProject, projectId },
		}));

		const { error } = await get().getProjectResources();

		return { error };
	},

	getProjectsList: async () => {
		const { data, error } = await ProjectsService.list();

		const updatedList = data?.map(({ projectId, name }) => ({
			id: projectId,
			name,
			href: `/${projectId}`,
		}));

		set((state) => ({ ...state, list: updatedList }));

		return { error, list: updatedList || [] };
	},

	setActiveTab: (activeTab) => set((state) => ({ ...state, activeTab })),

	setUpdateFileContent: (content) =>
		set((state) => {
			const fileName = state.currentProject.activeEditorFileName;

			if (!fileName) return state;

			state.currentProject.resources[fileName] = content;

			return state;
		}),

	setProjectResources: async (file) => {
		const fileContent = await readFileAsUint8Array(file);

		const { error } = await ProjectsService.setResources(get().currentProject.projectId!, {
			...get().currentProject.resources,
			[file.name]: fileContent,
		});

		if (error) return { error: { message: i18n.t("errors.projectIdNotFound") } };

		set((state) => {
			state.currentProject.activeEditorFileName = file.name;
			state.currentProject.resources[file.name] = fileContent;
			return state;
		});

		return { error };
	},

	setProjectEmptyResources: async (name) => {
		const { error } = await ProjectsService.setResources(get().currentProject.projectId!, {
			...get().currentProject.resources,
			[name]: new Uint8Array(),
		});

		if (error) return { error: { message: i18n.t("errors.projectIdNotFound") } };

		set((state) => {
			state.currentProject.activeEditorFileName = name;
			state.currentProject.resources[name] = new Uint8Array();
			return state;
		});

		return { error };
	},

	getProjectResources: async () => {
		if (isEmpty(get().currentProject.projectId)) return { error: { message: i18n.t("errors.projectIdNotFound") } };

		const { data, error } = await ProjectsService.getResources(get().currentProject.projectId!);

		if (data) {
			set((state) => {
				state.currentProject.resources = data;
				return state;
			});
		}

		return { error };
	},
});

export const useProjectStore = create(persist(immer(store), { name: EStoreName.project }));
