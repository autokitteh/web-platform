import { namespaces } from "@constants";
import { EStoreName } from "@enums";
import { IProjectStore } from "@interfaces/store";
import { LoggerService, ProjectsService } from "@services";
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
	| "updateActiveEditorFileName"
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
		const currentTab = get().currentProject.projectId === projectId ? get().activeTab : 1;

		set(() => ({
			...defaultState,
			activeTab: currentTab,
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

	setUpdateFileContent: async (content) => {
		const fileName = get().currentProject.activeEditorFileName;

		if (!fileName) return;

		const { error } = await ProjectsService.setResources(get().currentProject.projectId!, {
			...get().currentProject.resources,
			[fileName]: content,
		});

		if (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);
			return;
		}

		set((state) => {
			state.currentProject.resources[fileName] = content;
			return state;
		});
	},

	setProjectResources: async (files) => {
		const uploadFile = async (file: File) => {
			const fileContent = await readFileAsUint8Array(file);

			const { error } = await ProjectsService.setResources(get().currentProject.projectId!, {
				...get().currentProject.resources,
				[file.name]: fileContent,
			});

			if (error) return { error };

			set((state) => {
				state.currentProject.activeEditorFileName = file.name;
				state.currentProject.resources[file.name] = fileContent;
				return state;
			});
		};

		for (const file of files) {
			await uploadFile(file);
		}

		return { error: undefined };
	},

	setProjectEmptyResources: async (name) => {
		const { error } = await ProjectsService.setResources(get().currentProject.projectId!, {
			...get().currentProject.resources,
			[name]: new Uint8Array(),
		});

		if (error) return { error };

		set((state) => {
			state.currentProject.activeEditorFileName = name;
			state.currentProject.resources[name] = new Uint8Array();
			return state;
		});

		return { error: undefined };
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

	updateActiveEditorFileName: (fileName: string) => {
		set((state) => {
			state.currentProject.activeEditorFileName = fileName;
			return state;
		});
	},
});

export const useProjectStore = create(persist(immer(store), { name: EStoreName.project }));
