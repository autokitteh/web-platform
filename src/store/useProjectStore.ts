import { namespaces } from "@constants";
import { StoreName } from "@enums";
import { ProjectStore } from "@interfaces/store";
import { convertProtoProjectToMenuItemModel } from "@models/project.model";
import { LoggerService, ProjectsService } from "@services";
import { ProjectMenuItem } from "@type/models";
import { readFileAsUint8Array } from "@utilities";
import { updateOpenedFilesState } from "@utilities";
import { remove } from "lodash";
import randomatic from "randomatic";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

const defaultState: Omit<
	ProjectStore,
	| "getProjectMenutItems"
	| "renameProject"
	| "addProjectToMenu"
	| "createProject"
	| "setUpdateFileContent"
	| "setProjectResources"
	| "getProjectResources"
	| "getProject"
	| "setProjectEmptyResources"
	| "updateEditorOpenedFiles"
	| "reset"
	| "resetResources"
	| "updateEditorClosedFiles"
	| "removeProjectFile"
> = {
	menuList: [],
	openedFiles: [],
	resources: {},
};

const store: StateCreator<ProjectStore> = (set, get) => ({
	...defaultState,

	getProject: async (projectId: string) => {
		const project = get().menuList.find(({ id }) => id === projectId);
		if (project) return { data: project, error: undefined };
		const { data: responseProject, error } = await ProjectsService.get(projectId);

		if (error) {
			return { error, data: undefined };
		}
		if (!responseProject) {
			return { error: new Error("Project not found"), data: undefined };
		}

		return { error, data: convertProtoProjectToMenuItemModel(responseProject) };
	},

	createProject: async () => {
		const projectName = randomatic("Aa", 8);
		const { data: projectId, error } = await ProjectsService.create(projectName);

		if (error) {
			return { error, data: undefined };
		}
		if (!projectId) {
			return { error: new Error("Project not created"), data: undefined };
		}

		return { error: undefined, data: { projectId, name: projectName } };
	},

	addProjectToMenu: (project: ProjectMenuItem) => {
		set((state) => {
			state.menuList.push(project);
			return state;
		});
	},
	renameProject: async (projectId: string, newProjectName: string) => {
		set((state) => {
			const projectIndex = state.menuList.findIndex(({ id }) => id === projectId);
			if (projectIndex === -1) return state;
			state.menuList[projectIndex].name = newProjectName;
			return state;
		});
	},

	getProjectMenutItems: async () => {
		const { data: projects, error } = await ProjectsService.list();

		if (error) return { error, data: undefined };

		const convertedProjectsMenuItems = projects?.map(convertProtoProjectToMenuItemModel);

		set((state) => ({ ...state, menuList: convertedProjectsMenuItems }));

		return { error: undefined, data: convertedProjectsMenuItems };
	},

	setUpdateFileContent: async (content, projectId) => {
		const fileName = get().openedFiles.find(({ isActive }) => isActive)?.name;

		if (!fileName) return;

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

	setProjectEmptyResources: async (name, projectId) => {
		const { error } = await ProjectsService.setResources(projectId, {
			...get().resources,
			[name]: new Uint8Array(),
		});

		if (error) return { error };

		set((state) => {
			state.openedFiles = updateOpenedFilesState(state.openedFiles, name);
			state.resources[name] = new Uint8Array();
			return state;
		});

		return { error: undefined };
	},

	getProjectResources: async (resources) => {
		set((state) => {
			state.resources = resources;
			return state;
		});
	},

	updateEditorOpenedFiles: (fileName) => {
		const isFileActive = get().openedFiles.find(({ name }) => name === fileName)?.isActive;

		if (isFileActive) return;

		set((state) => {
			state.openedFiles = updateOpenedFilesState(state.openedFiles, fileName);
			return state;
		});
	},

	reset: () => {
		set(defaultState);
	},

	resetResources: () => {
		set((state) => {
			state.openedFiles = [];
			state.resources = {};
			return state;
		});
	},

	updateEditorClosedFiles: (fileName) => {
		set((state) => {
			const fileIndex = state.openedFiles.findIndex(({ name }) => name === fileName);
			const newOpenedFiles = remove([...state.openedFiles], ({ name }) => name !== fileName);

			if (state.openedFiles[fileIndex]?.isActive && newOpenedFiles.length > 0) {
				const newActiveIndex = Math.min(fileIndex, newOpenedFiles.length - 1);
				newOpenedFiles[newActiveIndex].isActive = true;
			}

			state.openedFiles = newOpenedFiles;
			return state;
		});
	},

	removeProjectFile: async (fileName, projectId) => {
		const updatedResources = { ...get().resources };
		delete updatedResources[fileName];

		const { error } = await ProjectsService.setResources(projectId, updatedResources);

		if (error) return { error };

		set((state) => {
			const updatedOpenedFiles = state.openedFiles.filter((file) => file.name !== fileName);

			state.resources = updatedResources;
			state.openedFiles = updatedOpenedFiles;
			return state;
		});

		return { error: undefined };
	},
});

export const useProjectStore = create(persist(immer(store), { name: StoreName.project }));
