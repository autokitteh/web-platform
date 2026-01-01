import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { SidebarHrefMenu } from "@enums/components";
import { LoggerService } from "@services/logger.service";
import { descopeProjectId, namespaces } from "@src/constants";
import { Project } from "@type/models";

import { useOrganizationStore, useProjectStore, useSharedBetweenProjectsStore, useToastStore } from "@store";

export const useProjectsMenu = () => {
	const { t } = useTranslation(["menu", "errors"]);
	const { getProjectsList, projectsList } = useProjectStore();
	const navigate = useNavigate();
	const { projectId } = useParams();
	const addToast = useToastStore((state) => state.addToast);
	const [sortedProjectsList, setSortedProjectsList] = useState<Project[]>([]);
	const { user } = useOrganizationStore();
	const { drawers, settingsPath } = useSharedBetweenProjectsStore();

	useEffect(() => {
		const sortedProjects = projectsList.slice().sort((a, b) => a.name.localeCompare(b.name));
		setSortedProjectsList(sortedProjects);
	}, [projectsList]);

	const fetchProjects = async () => {
		const { error } = await getProjectsList();
		if (error) {
			addToast({
				message: t("projectsListFetchFailed"),
				type: "error",
			});

			LoggerService.error(
				namespaces.ui.menu,
				t("projectsListFetchFailedExtended", {
					error,
				})
			);
		}
	};

	useEffect(() => {
		if (!descopeProjectId) {
			fetchProjects();
			return;
		}
		if (user) {
			fetchProjects();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleProjectSelect = ({ id: selectedProjectId }: { id: string }) => {
		const isSettingsDrawerOpen = drawers[selectedProjectId]?.settings === true;
		const storedSettingsPath = settingsPath[selectedProjectId];
		const basePath = `/${SidebarHrefMenu.projects}/${selectedProjectId}/explorer`;
		const fullPath = isSettingsDrawerOpen && storedSettingsPath ? `${basePath}/${storedSettingsPath}` : basePath;
		navigate(fullPath);
	};

	const handleNewProject = () => navigate("/ai");

	return {
		handleNewProject,
		handleProjectSelect,
		projectId,
		sortedProjectsList,
		t,
	};
};
