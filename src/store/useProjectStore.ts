import { t } from "i18next";
import { load } from "js-yaml";
import isEqual from "lodash/isEqual";
import { StateCreator, create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { EventListenerName } from "@enums";
import { SidebarHrefMenu } from "@enums/components";
import { ProjectStore } from "@interfaces/store";
import { ProjectsService } from "@services";
import { defaultProjectDirectory, defaultProjectFile } from "@src/constants";
import { triggerEvent } from "@src/hooks/useEventListener";
import { useOrganizationStore } from "@src/store";
import { ProjectActionType } from "@src/types/components";
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
	| "setIsExporting"
	| "setIsDeleting"
	| "setLoadingImportFile"
	| "setActionInProcess"
	| "isProjectNameTaken"
	| "actions"
> = {
	projectsList: [],
	isLoadingProjectsList: true,
	currentProjectId: undefined,
	pendingFile: undefined,
	isExporting: false,
	isDeleting: false,
	loadingImportFile: false,
	actionInProcess: {
		build: false,
		deploy: false,
		manualRun: false,
	},
};

const store: StateCreator<ProjectStore> = (set, get) => ({
	...defaultState,
	setActionInProcess: (action: ProjectActionType, value: boolean) => {
		set((state) => {
			state.actionInProcess[action] = value;
			return state;
		});
	},

	setPendingFile: (file) => {
		set((state) => {
			state.pendingFile = file;
			return state;
		});
	},

	setLoadingImportFile: (value) => {
		set((state) => {
			state.loadingImportFile = value;
			return state;
		});
	},

	setIsExporting: (value) => {
		set((state) => {
			state.isExporting = value;
			return state;
		});
	},

	setIsDeleting: (value) => {
		set((state) => {
			state.isDeleting = value;
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

	createProjectFromManifest: async (projectManifest) => {
		const currentOrganization = useOrganizationStore.getState().currentOrganization;
		const manifestObject = load(projectManifest) as {
			project?: { name: string };
		};

		const projectName = manifestObject?.project?.name;
		if (!projectName) {
			return { data: undefined, error: new Error(t("projects.projectNameRequiredManifest", { ns: "stores" })) };
		}

		const { data: projectData, error: createError } = await get().createProject(projectName);
		if (createError || !projectData?.projectId) {
			return { data: undefined, error: createError };
		}

		try {
			await ProjectsService.applyManifest(projectManifest, currentOrganization?.id);
		} catch (error) {
			const { error: errorDelete } = await ProjectsService.delete(projectData.projectId);
			if (error) {
				return { data: undefined, error: errorDelete };
			}
			return { data: undefined, error };
		}

		return { data: projectData.projectId, error: undefined };
	},

	deleteProject: async (projectId: string) => {
		const { error } = await ProjectsService.delete(projectId);

		if (error) {
			return { data: undefined, error };
		}

		let projectName = "";

		set((state) => {
			const projectIndex = state.projectsList.findIndex(({ id }) => id === projectId);

			if (projectIndex === -1) {
				return state;
			}

			projectName = state.projectsList[projectIndex].name;

			const updatedProjectsList = [...state.projectsList];
			updatedProjectsList.splice(projectIndex, 1);

			return { projectsList: updatedProjectsList };
		});

		triggerEvent(EventListenerName.clearTourStepListener);

		return { data: projectName, error: undefined };
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
	isProjectNameTaken: (projectName: string) => get().projectsList.some((project) => project.name === projectName),
});

export const useProjectStore = create(immer(store));
