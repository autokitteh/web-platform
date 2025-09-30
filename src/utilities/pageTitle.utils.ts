import { PageTitles } from "@constants";

import { useProjectStore } from "@store";

export const getPageTitleFromPath = (pathname: string): { pageTitle: PageTitles; projectName?: string } => {
	if (pathname.startsWith("/projects/")) {
		const projectIdMatch = pathname.match(/^\/projects\/([^/]+)(?:\/([^/]+.*?))?/);
		const projectId = projectIdMatch?.[1];
		const subPath = projectIdMatch?.[2];
		const { projectsList } = useProjectStore.getState();
		const project = projectId ? projectsList.find((p) => p.id === projectId) : undefined;

		if (subPath) {
			if (subPath.startsWith("deployments"))
				return { pageTitle: PageTitles.ProjectDeployments, projectName: project?.name };
			if (subPath.startsWith("sessions"))
				return { pageTitle: PageTitles.ProjectSessions, projectName: project?.name };
			if (subPath.startsWith("events"))
				return { pageTitle: PageTitles.ProjectEvents, projectName: project?.name };
			if (subPath.startsWith("connections"))
				return { pageTitle: PageTitles.ProjectConnections, projectName: project?.name };
			if (subPath.startsWith("triggers"))
				return { pageTitle: PageTitles.ProjectTriggers, projectName: project?.name };
			if (subPath.startsWith("variables"))
				return { pageTitle: PageTitles.ProjectVariables, projectName: project?.name };
			if (subPath.startsWith("code")) return { pageTitle: PageTitles.ProjectCode, projectName: project?.name };
		}

		return { pageTitle: PageTitles.ProjectAssets, projectName: project?.name };
	}
	if (pathname.startsWith("/ai")) return { pageTitle: PageTitles.Ai };
	if (pathname.startsWith("/welcome")) return { pageTitle: PageTitles.Welcome };
	if (pathname.startsWith("/intro")) return { pageTitle: PageTitles.Intro };
	if (pathname.startsWith("/events")) return { pageTitle: PageTitles.Events };
	if (pathname.startsWith("/chat")) return { pageTitle: PageTitles.Chat };
	if (pathname.startsWith("/settings") || pathname.startsWith("/organization-settings"))
		return { pageTitle: PageTitles.Settings };
	if (pathname.startsWith("/404")) return { pageTitle: PageTitles.NotFound };
	if (pathname === "/") return { pageTitle: PageTitles.Home };
	return { pageTitle: PageTitles.Base };
};
