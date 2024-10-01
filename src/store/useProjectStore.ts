import i18n from "i18next";
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
	| "createProjectFromManifest"
> = {
	projectsList: [],
	isLoadingProjectsList: true,
};

const store: StateCreator<ProjectStore> = (set, get) => ({
	...defaultState,

	createProject: async (isDefault?: boolean) => {
		const { data: projectId, error } = await ProjectsService.create();

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
			const defaultResource = await fetchFileContent(
				`/assets/templates/${defaultProjectDirectory}/${defaultProjectFile}`
			);

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

	createProjectFromManifest: async (projectManifest: string) => {
		const { data: newProjectId, error } = await ProjectsService.createFromManifest(projectManifest);
		if (error) {
			return { data: undefined, error };
		}

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
			set((state) => ({ ...state, isLoadingProjectsList: false }));

			return { data: undefined, error };
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