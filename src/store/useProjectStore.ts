import { namespaces } from "@constants";
import { StoreName } from "@enums";
import { ProjectTabs } from "@enums/components";
import { SidebarHrefMenu } from "@enums/components";
import { ProjectStore } from "@interfaces/store";
import { LoggerService, ProjectsService } from "@services";
import { readFileAsUint8Array } from "@utilities";
import { updateOpenedFilesState } from "@utilities";
import { remove } from "lodash";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const defaultState: Omit<
	ProjectStore,
	| "setActiveTab"
	| "getProjectsList"
	| "setUpdateFileContent"
	| "setProjectResources"
	| "getProjectResources"
	| "setProjectEmptyResources"
	| "updateEditorOpenedFiles"
	| "resetEditorOpenedFiles"
	| "updateEditorClosedFiles"
	| "removeProjectFile"
> = {
	list: [],
	currentProject: {
		openedFiles: [],
		resources: {},
	},
	activeTab: ProjectTabs.codeAndAssets,
};

const store: StateCreator<ProjectStore> = (set, get) => ({
	...defaultState,

	setActiveTab: (activeTab) => set((state) => ({ ...state, activeTab })),

	getProjectsList: async () => {
		const { data, error } = await ProjectsService.list();

		if (error) return { error, list: [] };

		const updatedList = data?.map(({ projectId, name }) => ({
			id: projectId,
			name,
			href: `/${SidebarHrefMenu.projects}/${projectId}`,
		}));

		set((state) => ({ ...state, list: updatedList }));

		return { error: undefined, list: updatedList || [] };
	},

	setUpdateFileContent: async (content, projectId) => {
		const fileName = get().currentProject.openedFiles.find(({ isActive }) => isActive)?.name;

		if (!fileName) return;

		const { error } = await ProjectsService.setResources(projectId, {
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

	setProjectResources: async (files, projectId) => {
		for (const file of files) {
			const fileContent = await readFileAsUint8Array(file);

			const { error } = await ProjectsService.setResources(projectId, {
				...get().currentProject.resources,
				[file.name]: fileContent,
			});

			if (error) {
				return { error, fileName: file.name };
			}

			set((state) => {
				state.currentProject.openedFiles = updateOpenedFilesState(state.currentProject.openedFiles, file.name);
				state.currentProject.resources[file.name] = fileContent;
				return state;
			});
		}

		return { error: undefined };
	},

	setProjectEmptyResources: async (name, projectId) => {
		const { error } = await ProjectsService.setResources(projectId, {
			...get().currentProject.resources,
			[name]: new Uint8Array(),
		});

		if (error) return { error };

		set((state) => {
			state.currentProject.openedFiles = updateOpenedFilesState(state.currentProject.openedFiles, name);
			state.currentProject.resources[name] = new Uint8Array();
			return state;
		});

		return { error: undefined };
	},

	getProjectResources: async (resources) => {
		set((state) => {
			state.currentProject.resources = resources;
			return state;
		});
	},

	updateEditorOpenedFiles: (fileName) => {
		const isFileActive = get().currentProject.openedFiles.find(({ name }) => name === fileName)?.isActive;

		if (isFileActive) return;

		set((state) => {
			state.currentProject.openedFiles = updateOpenedFilesState(state.currentProject.openedFiles, fileName);
			return state;
		});
	},

	resetEditorOpenedFiles: () => {
		set((state) => {
			state.currentProject.openedFiles = [];
			state.currentProject.resources = {};
			return state;
		});
	},

	updateEditorClosedFiles: (fileName) => {
		set((state) => {
			const { openedFiles } = state.currentProject;
			const fileIndex = openedFiles.findIndex(({ name }) => name === fileName);
			const newOpenedFiles = remove([...openedFiles], ({ name }) => name !== fileName);

			if (openedFiles[fileIndex]?.isActive && newOpenedFiles.length > 0) {
				const newActiveIndex = Math.min(fileIndex, newOpenedFiles.length - 1);
				newOpenedFiles[newActiveIndex].isActive = true;
			}

			state.currentProject.openedFiles = newOpenedFiles;
			return state;
		});
	},

	removeProjectFile: async (fileName, projectId) => {
		const updatedResources = { ...get().currentProject.resources };
		delete updatedResources[fileName];

		const { error } = await ProjectsService.setResources(projectId, updatedResources);

		if (error) return { error };

		set((state) => {
			const updatedOpenedFiles = state.currentProject.openedFiles.filter((file) => file.name !== fileName);

			state.currentProject.resources = updatedResources;
			state.currentProject.openedFiles = updatedOpenedFiles;
			return state;
		});

		return { error: undefined };
	},
});

export const useProjectStore = create(persist(immer(store), { name: StoreName.project }));
