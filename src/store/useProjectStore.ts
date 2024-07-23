import { cloneDeep, isEqual } from "lodash";
import randomatic from "randomatic";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { namespaces } from "@constants";
import { StoreName } from "@enums";
import { SidebarHrefMenu } from "@enums/components";
import { ProjectStore } from "@interfaces/store";
import { LoggerService, ProjectsService } from "@services";
import { readFileAsUint8Array, updateOpenedFilesState } from "@utilities";

const defaultState: Omit<
	ProjectStore,
	| "createProject"
	| "deleteProject"
	| "getProject"
	| "getProjectsList"
	| "getProjectResources"
	| "removeProjectFile"
	| "renameProject"
	| "reset"
	| "setProjectEmptyResources"
	| "setProjectResources"
	| "setUpdateFileContent"
	| "updateEditorClosedFiles"
	| "updateEditorOpenedFiles"
> = {
	projectsList: [],
	openedFiles: [],
	resources: {},
};

const store: StateCreator<ProjectStore> = (set, get) => ({
	...defaultState,

	createProject: async () => {
		const projectName = randomatic("Aa", 8);
		const { data: projectId, error } = await ProjectsService.create(projectName);

		if (error) {
			return { data: undefined, error };
		}
		if (!projectId) {
			return { data: undefined, error: new Error("Project not created") };
		}

		const menuItem = {
			href: `/${SidebarHrefMenu.projects}/${projectId}`,
			id: projectId,
			name: projectName,
		};

		set((state) => {
			state.projectsList.push(menuItem);

			return state;
		});

		return { data: { name: projectName, projectId }, error: undefined };
	},

	deleteProject: async (projectId: string) => {
		const { error } = await ProjectsService.delete(projectId);

		if (error) {
			return { data: undefined, error };
		}

		set((state) => {
			const projectIndex = state.projectsList.findIndex(({ id }) => id === projectId);

			if (projectIndex === -1) {
				return state;
			}

			const updatedProjectsList = [...state.projectsList];
			updatedProjectsList.splice(projectIndex, 1);

			return { projectsList: updatedProjectsList };
		});

		return { data: undefined, error: undefined };
	},

	getProject: async (projectId: string) => {
		const project = get().projectsList.find(({ id }) => id === projectId);
		if (project) {
			return { data: project, error: undefined };
		}
		const { data: responseProject, error } = await ProjectsService.get(projectId);

		if (error) {
			return { data: undefined, error };
		}
		if (!responseProject) {
			return { data: undefined, error: new Error("Project not found") };
		}

		return { data: responseProject, error };
	},

	getProjectsList: async () => {
		const { data: projects, error } = await ProjectsService.list();

		if (error) {
			return { data: undefined, error };
		}

		set((state) => ({ ...state, projectsList: projects }));

		return { data: projects, error: undefined };
	},

	getProjectResources: async (resources) => {
		set((state) => {
			const stateResourcesConverted: Record<string, Uint8Array> = {};
			for (const [key, value] of Object.entries(get().resources)) {
				stateResourcesConverted[key] = new Uint8Array(Object.values(value));
			}

			if (!resources) {
				state.openedFiles = [];

				return state;
			}

			if (isEqual(cloneDeep(resources), cloneDeep(stateResourcesConverted))) {
				return state;
			}
			state.openedFiles = [];
			state.resources = resources;

			return state;
		});
	},

	removeProjectFile: async (fileName, projectId) => {
		const updatedResources = { ...get().resources };
		delete updatedResources[fileName];

		const { error } = await ProjectsService.setResources(projectId, updatedResources);

		if (error) {
			return { error };
		}

		set((state) => {
			const updatedOpenedFiles = state.openedFiles.filter((file) => file.name !== fileName);

			state.resources = updatedResources;
			state.openedFiles = updatedOpenedFiles;

			return state;
		});

		return { error: undefined };
	},

	renameProject: async (projectId: string, newProjectName: string) => {
		set((state) => {
			const projectIndex = state.projectsList.findIndex(({ id }) => id === projectId);
			if (projectIndex === -1) {
				return state;
			}
			state.projectsList[projectIndex].name = newProjectName;

			return state;
		});
	},

	reset: () => {
		set(defaultState);
	},

	setProjectEmptyResources: async (name, projectId) => {
		const { error } = await ProjectsService.setResources(projectId, {
			...get().resources,
			[name]: new Uint8Array(),
		});

		if (error) {
			return { error };
		}

		set((state) => {
			state.openedFiles = updateOpenedFilesState(state.openedFiles, name);
			state.resources[name] = new Uint8Array();

			return state;
		});

		return { error: undefined };
	},

	setProjectResources: async (files, projectId) => {
		for (const file of files) {
			const fileContent = await readFileAsUint8Array(file);

			const { error } = await ProjectsService.setResources(projectId, {
				...get().resources,
				[file.name]: fileContent,
			});

			if (error) {
				return { error, fileName: file.name };
			}

			set((state) => {
				state.openedFiles = updateOpenedFilesState(state.openedFiles, file.name);
				state.resources[file.name] = fileContent;

				return state;
			});
		}

		return { error: undefined };
	},

	setUpdateFileContent: async (content, projectId) => {
		const fileName = get().openedFiles.find(({ isActive }) => isActive)?.name;

		if (!fileName) {
			return;
		}

		const { error } = await ProjectsService.setResources(projectId, {
			...get().resources,
			[fileName]: content,
		});

		if (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);

			return;
		}

		set((state) => {
			state.resources[fileName] = content;

			return state;
		});
	},

	updateEditorClosedFiles: (fileName) => {
		set((state) => {
			const fileIndex = state.openedFiles.findIndex(({ name }) => name === fileName);
			const newOpenedFiles = state.openedFiles.filter(({ name }) => name !== fileName);

			if (newOpenedFiles.length) {
				const activeFileIndex = state.openedFiles.findIndex(
					({ name }) => name === fileName && state.openedFiles[fileIndex]?.isActive
				);

				if (activeFileIndex !== -1) {
					const newActiveIndex = Math.min(activeFileIndex, newOpenedFiles.length - 1);
					newOpenedFiles[newActiveIndex].isActive = true;
				}
			}

			state.openedFiles = newOpenedFiles;

			return state;
		});
	},

	updateEditorOpenedFiles: (fileName) => {
		const isFileActive = get().openedFiles.find(({ name }) => name === fileName)?.isActive;

		if (isFileActive) {
			return;
		}

		set((state) => {
			const newOpenedFiles = updateOpenedFilesState(state.openedFiles, fileName);
			state.openedFiles = newOpenedFiles;

			return state;
		});
	},
});

export const useProjectStore = create(persist(immer(store), { name: StoreName.project }));
