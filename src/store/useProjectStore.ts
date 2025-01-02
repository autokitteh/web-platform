import i18n from "i18next";
import yaml from "js-yaml";
import isEqual from "lodash/isEqual";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { SidebarHrefMenu } from "@enums/components";
import { ProjectStore } from "@interfaces/store";
import { ProjectsService } from "@services";
import { defaultProjectDirectory, defaultProjectFile } from "@src/constants";
import { fetchFileContent } from "@src/utilities";

const defaultState: Omit<
	ProjectStore,
	| "createProject"
	| "getProject"
	| "getProjectsList"
	| "renameProject"
	| "projectList"
	| "deleteProject"
	| "exportProject"
	| "createProjectFromManifest"
	| "setEditorWidth"
	| "setPendingFile"
	| "setLatestOpened"
> = {
	projectsList: [],
	isLoadingProjectsList: true,
	initialEditorWidth: 50,
	currentProjectId: undefined,
	pendingFile: undefined,
	isExporting: false,
	latestOpened: {
		tab: "",
		deploymentId: "",
		projectId: undefined,
	},
};

const store: StateCreator<ProjectStore> = (set, get) => ({
	...defaultState,

	setLatestOpened: (type, value, projectId) => {
		set((state) => {
			if (projectId && projectId !== state.latestOpened.projectId) {
				state.latestOpened = {
					tab: "",
					deploymentId: "",
					projectId,
				};
				state.latestOpened = {
					tab: type === "tab" ? value : "",
					deploymentId: type === "deploymentId" ? value : "",
					projectId,
				};

				return state;
			}

			state.latestOpened[type] = value;
			state.latestOpened.projectId = projectId;

			return state;
		});
	},

	setEditorWidth: (width) => {
		set((state) => {
			state.initialEditorWidth = width;

			return state;
		});
	},

	setPendingFile: (file) => {
		set((state) => {
			state.pendingFile = file;

			return state;
		});
	},

	createProject: async (name: string, isDefault?: boolean) => {
		const { data: projectId, error } = await ProjectsService.create(name);

		if (error) {
			return { data: undefined, error };
		}
		if (!projectId) {
			return { data: undefined, error: new Error("Project not created") };
		}

		const { data: project, error: nameError } = await ProjectsService.get(projectId);

		if (nameError) {
			return { data: undefined, error: nameError };
		}
		if (!project) {
			return { data: undefined, error: new Error("Project could not be fetched") };
		}

		if (isDefault) {
			const defaultResource = await fetchFileContent(`/assets/${defaultProjectDirectory}/${defaultProjectFile}`);

			const defaultResources = {
				[defaultProjectFile.toString()]: new TextEncoder().encode(defaultResource || ""),
			};

			const { error: saveResourceError } = await ProjectsService.setResources(projectId, defaultResources);

			if (saveResourceError) {
				return { data: undefined, error: i18n.t("couldntSaveDefaultFileForProject", { ns: "errors" }) };
			}
		}

		const menuItem = {
			href: `/${SidebarHrefMenu.projects}/${projectId}`,
			id: projectId,
			name: project.name,
		};

		set((state) => {
			state.projectsList.push(menuItem);

			return state;
		});

		return { data: { name: project.name, projectId }, error: undefined };
	},

	exportProject: async (projectId: string) => {
		const { data: akProjectArchiveZip, error } = await ProjectsService.export(projectId!);

		if (error) {
			return { error, data: undefined };
		}

		return { data: akProjectArchiveZip, error: undefined };
	},

	createProjectFromManifest: async (projectManifest: string) => {
		const { data: newProjectId, error } = await ProjectsService.createFromManifest(projectManifest);

		if (error) {
			return { data: undefined, error };
		}

		if (!newProjectId) {
			return { data: undefined, error: i18n.t("projectCreationFailed", { ns: "errors" }) };
		}

		const manifestObject = yaml.load(projectManifest) as {
			project?: { name: string };
		};

		let projectName = manifestObject?.project?.name;

		if (!projectName) {
			const { data: project, error: getProjectError } = await ProjectsService.get(newProjectId);

			if (!getProjectError) {
				return { data: undefined, error: getProjectError };
			}
			if (!project) {
				return { data: undefined, error: i18n.t("projectLoadingFailed", { ns: "errors" }) };
			}

			projectName = project.name;
		}

		const menuItem = {
			href: `/${SidebarHrefMenu.projects}/${newProjectId}`,
			id: newProjectId,
			name: projectName,
		};

		set((state) => {
			state.projectsList.push(menuItem);

			return state;
		});

		return { data: newProjectId, error: undefined };
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
		const projectsList = get().projectsList;
		if (!projectsList.length) {
			set((state) => ({ ...state, isLoadingProjectsList: true }));
		}

		const { data: projects, error } = await ProjectsService.list();

		if (error) {
			set((state) => ({ ...state, isLoadingProjectsList: false, projectsList: [] }));

			return { data: undefined, error };
		}

		if (isEqual(projects, projectsList)) {
			set((state) => ({ ...state, isLoadingProjectsList: false }));

			return { data: projectsList, error: undefined };
		}

		set((state) => ({ ...state, projectsList: projects, isLoadingProjectsList: false }));

		return { data: projects, error: undefined };
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
});

export const useProjectStore = create(persist(immer(store), { name: StoreName.project }));
