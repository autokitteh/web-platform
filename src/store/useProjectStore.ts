import { namespaces } from "@constants";
import { EStoreName } from "@enums";
import { EProjectTabs } from "@enums/components";
import { ESidebarHrefMenu } from "@enums/components";
import { IProjectStore } from "@interfaces/store";
import { LoggerService, ProjectsService, EnvironmentsService, VariablesService } from "@services";
import { TEnvironment } from "@type/models";
import { readFileAsUint8Array } from "@utilities";
import { map, uniqBy } from "lodash";
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
	| "getProjectEnvironments"
	| "getProjectVariables"
	| "setProjectModifyVariable"
	| "updateEditorOpenedFiles"
	| "updateEditorClosedFiles"
> = {
	list: [],
	currentProject: {
		projectId: undefined,
		openedFiles: [],
		resources: {},
		environments: [],
		variables: [],
		activeModifyVariable: undefined,
	},
	activeTab: EProjectTabs.codeAndAssets,
};

const store: StateCreator<IProjectStore> = (set, get) => ({
	...defaultState,
	loadProject: async (projectId) => {
		const activeTab = get().currentProject.projectId === projectId ? get().activeTab : EProjectTabs.codeAndAssets;
		const openedFiles = get().currentProject.projectId === projectId ? get().currentProject.openedFiles : [];

		set(() => ({
			...defaultState,
			activeTab,
			currentProject: { ...defaultState.currentProject, projectId, openedFiles },
		}));

		try {
			await Promise.all([get().getProjectResources(), get().getProjectEnvironments(), get().getProjectVariables()]);

			return { error: undefined };
		} catch (error) {
			return { error };
		}
	},

	getProjectsList: async () => {
		const { data, error } = await ProjectsService.list();

		const updatedList = data?.map(({ projectId, name }) => ({
			id: projectId,
			name,
			href: `/${ESidebarHrefMenu.projects}/${projectId}`,
		}));

		set((state) => ({ ...state, list: updatedList }));

		return { error, list: updatedList || [] };
	},

	setActiveTab: (activeTab) => set((state) => ({ ...state, activeTab })),

	setUpdateFileContent: async (content) => {
		const fileName = get().currentProject.openedFiles.find(({ isActive }) => isActive)?.name;

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
		for (const file of files) {
			const fileContent = await readFileAsUint8Array(file);

			const { error } = await ProjectsService.setResources(get().currentProject.projectId!, {
				...get().currentProject.resources,
				[file.name]: fileContent,
			});

			if (error) {
				return { error, fileName: file.name };
			}

			set((state) => {
				state.currentProject.openedFiles = [...state.currentProject.openedFiles, { name: file.name, isActive: true }];
				state.currentProject.resources[file.name] = fileContent;
				return state;
			});
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
			state.currentProject.openedFiles = [...state.currentProject.openedFiles, { name, isActive: true }];
			state.currentProject.resources[name] = new Uint8Array();
			return state;
		});

		return { error: undefined };
	},

	getProjectResources: async () => {
		const { data: resources, error } = await ProjectsService.getResources(get().currentProject.projectId!);

		if (resources) {
			set((state) => {
				state.currentProject.resources = resources;
				return state;
			});
		}

		return { error };
	},

	getProjectEnvironments: async () => {
		const { data: envs, error } = await EnvironmentsService.listByProjectId(get().currentProject.projectId!);

		if (envs) {
			set((state) => {
				state.currentProject.environments = envs;
				return state;
			});
		}

		return { data: envs, error };
	},

	getProjectVariables: async () => {
		const { data: environments, error: errorEnvs } = await get().getProjectEnvironments();

		if (errorEnvs) return { error: errorEnvs };

		const envId = (environments as TEnvironment[])[0].envId;
		const { data: vars, error } = await VariablesService.list(envId);

		if (vars) {
			set((state) => {
				state.currentProject.variables = vars;
				return state;
			});
		}

		return { error };
	},

	updateEditorOpenedFiles: (fileName) => {
		if (get().currentProject.openedFiles.find(({ name }) => name === fileName)?.isActive) return;

		set((state) => {
			state.currentProject.openedFiles = uniqBy(
				[
					...map(state.currentProject.openedFiles, (file) => ({ ...file, isActive: file.name === fileName })),
					{ name: fileName, isActive: true },
				],
				"name"
			);
			return state;
		});
	},

	updateEditorClosedFiles: (fileName) => {
		set((state) => {
			const { openedFiles } = state.currentProject;
			const fileIndex = openedFiles.findIndex(({ name }) => name === fileName);
			const newOpenedFiles = openedFiles.filter(({ name }) => name !== fileName);
			const newActiveIndex = openedFiles[fileIndex].isActive && newOpenedFiles.length > 0 ? fileIndex - 1 : null;

			if (newActiveIndex !== null) {
				newOpenedFiles[newActiveIndex].isActive = true;
			}

			state.currentProject.openedFiles = newOpenedFiles;
			return state;
		});
	},

	setProjectModifyVariable: (name, value) => {
		set((state) => {
			state.currentProject.activeModifyVariable = { name, value };
			return state;
		});
	},
});

export const useProjectStore = create(persist(immer(store), { name: EStoreName.project }));
