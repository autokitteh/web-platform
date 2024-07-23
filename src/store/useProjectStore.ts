import randomatic from "randomatic";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { SidebarHrefMenu } from "@enums/components";
import { ProjectStore } from "@interfaces/store";
import { ProjectsService } from "@services";

const defaultState: Omit<
	ProjectStore,
	"createProject" | "getProject" | "getProjectsList" | "renameProject" | "reset" | "projectList" | "deleteProject"
> = {
	projectsList: [],
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
});

export const useProjectStore = create(persist(immer(store), { name: StoreName.project }));
