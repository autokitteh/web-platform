import { PageTitles } from "@constants";

import { useProjectStore } from "@store";

export const getPageTitleFromPath = (pathname: string): { pageTitle: PageTitles; projectName?: string } => {
	if (pathname.startsWith("/projects/")) {
		const projectIdMatch = pathname.match(/^\/projects\/([^/]+)(?:\/(.+))?/);
		const projectId = projectIdMatch?.[1];
		const subPath = projectIdMatch?.[2];
		const { projectsList } = useProjectStore.getState();
		const project = projectId ? projectsList.find((p) => p.id === projectId) : undefined;

		if (subPath) {
			if (subPath.startsWith("deployments"))
				return { pageTitle: PageTitles.PROJECT_DEPLOYMENTS, projectName: project?.name };
			if (subPath.startsWith("sessions"))
				return { pageTitle: PageTitles.PROJECT_SESSIONS, projectName: project?.name };
			if (subPath.startsWith("events"))
				return { pageTitle: PageTitles.PROJECT_EVENTS, projectName: project?.name };
			if (subPath.startsWith("connections"))
				return { pageTitle: PageTitles.PROJECT_CONNECTIONS, projectName: project?.name };
			if (subPath.startsWith("triggers"))
				return { pageTitle: PageTitles.PROJECT_TRIGGERS, projectName: project?.name };
			if (subPath.startsWith("variables"))
				return { pageTitle: PageTitles.PROJECT_VARIABLES, projectName: project?.name };
			if (subPath.startsWith("code")) return { pageTitle: PageTitles.PROJECT_CODE, projectName: project?.name };
		}

		return { pageTitle: PageTitles.PROJECT_ASSETS, projectName: project?.name };
	}
	if (pathname.startsWith("/ai")) return { pageTitle: PageTitles.AI };
	if (pathname.startsWith("/welcome")) return { pageTitle: PageTitles.WELCOME };
	if (pathname.startsWith("/intro")) return { pageTitle: PageTitles.INTRO };
	if (pathname.startsWith("/chat")) return { pageTitle: PageTitles.CHAT };
	if (pathname.startsWith("/settings") || pathname.startsWith("/organization-settings"))
		return { pageTitle: PageTitles.SETTINGS };
	if (pathname.startsWith("/404")) return { pageTitle: PageTitles.NotFound };
	if (pathname === "/") return { pageTitle: PageTitles.HOME };
	return { pageTitle: PageTitles.BASE };
};
