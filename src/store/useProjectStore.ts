import { t } from "i18next";
import { load } from "js-yaml";
import isEqual from "lodash/isEqual";
import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { EventListenerName, ProjectActions, StoreName } from "@enums";
import { SidebarHrefMenu } from "@enums/components";
import { ProjectStore } from "@interfaces/store";
import { ProjectsService } from "@services";
import { defaultProjectDirectory, defaultProjectFile } from "@src/constants";
import { triggerEvent } from "@src/hooks/useEventListener";
import { useOrganizationStore } from "@src/store";
import { fetchFileContent } from "@src/utilities";

const defaultState: Omit<
	ProjectStore,
	| "createProject"
	| "getProject"
	| "getProjectsList"
	| "renameProject"
	| "deleteProject"
	| "exportProject"
	| "createProjectFromManifest"
	| "setPendingFile"
	| "setLatestOpened"
	| "setActionInProcess"
	| "actions"
> = {
	projectsList: [],
	isLoadingProjectsList: true,
	currentProjectId: undefined,
	pendingFile: undefined,
	isExporting: false,
	latestOpened: {
		tab: "",
		deploymentId: "",
		projectId: undefined,
	},
	actionInProcess: {
		[ProjectActions.build]: false,
		[ProjectActions.deploy]: false,
		[ProjectActions.manualRun]: false,
	},
};

const store: StateCreator<ProjectStore> = (set, get) => ({
	...defaultState,
	setActionInProcess: (action: ProjectActions, value: boolean) => {
		set((state) => {
			state.actionInProcess[action] = value;
			return state;
		});
	},

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

	setPendingFile: (file) => {
		set((state) => {
			state.pendingFile = file;
			return state;
		});
	},

	createProject: async (name: string, isDefault?: boolean) => {
		const currentOrganization = useOrganizationStore.getState().currentOrganization;

		const { data: projectId, error } = await ProjectsService.create({
			id: "",
			name,
			organizationId: currentOrganization?.id,
		});

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
			const { data: defaultResource, error: fileError } = await fetchFileContent(
				`/assets/${defaultProjectDirectory}/${defaultProjectFile}`
			);

			if (fileError) {
				return { data: undefined, error: fileError.message };
			}

			const defaultResources = {
				[defaultProjectFile.toString()]: new TextEncoder().encode(defaultResource || ""),
			};

			const { error: saveResourceError } = await ProjectsService.setResources(projectId, defaultResources);

			if (saveResourceError) {
				return { data: undefined, error: t("couldntSaveDefaultFileForProject", { ns: "errors" }) };
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
		const currentOrganization = useOrganizationStore.getState().currentOrganization;

		const { data: newProjectId, error } = await ProjectsService.createFromManifest(
			projectManifest,
			currentOrganization?.id
		);

		if (error) {
			return { data: undefined, error };
		}

		if (!newProjectId) {
			return { data: undefined, error: t("projectCreationFailed", { ns: "errors" }) };
		}

		const manifestObject = load(projectManifest) as {
			project?: { name: string };
		};

		let projectName = manifestObject?.project?.name;

		if (!projectName) {
			const { data: project, error: getProjectError } = await ProjectsService.get(newProjectId);

			if (!getProjectError) {
				return { data: undefined, error: getProjectError };
			}
			if (!project) {
				return { data: undefined, error: t("projectLoadingFailed", { ns: "errors" }) };
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

		triggerEvent(EventListenerName.clearTourStepListener);

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
		const { currentOrganization } = useOrganizationStore.getState();

		const { data: projects, error } = await ProjectsService.list(currentOrganization?.id);

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

	actions: {
		fetchProjectsListAndCheckName: async (projectName: string) => {
			set((state) => {
				state.isLoadingProjectsList = true;
				return state;
			});

			const { currentOrganization } = useOrganizationStore.getState();

			const { data: projects, error } = await ProjectsService.list(currentOrganization?.id);

			if (error) {
				set((state) => {
					state.isLoadingProjectsList = false;
					state.projectsList = [];
					return state;
				});
				return { error, exists: false, projects: [] };
			}

			set((state) => {
				state.projectsList = projects || [];
				state.isLoadingProjectsList = false;
				return state;
			});

			const exists = projects?.some((project) => project.name === projectName) || false;

			return { error: undefined, exists, projects: projects || [] };
		},
	},
});

export const useProjectStore = create(persist(immer(store), { name: StoreName.project }));

export const useProjectStoreActions = () => useProjectStore((state) => state.actions);
