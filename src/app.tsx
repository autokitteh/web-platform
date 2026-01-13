import React, { useEffect, useState } from "react";

import ga4 from "react-ga4";
import { useTranslation } from "react-i18next";
import { useLocation, useParams, useRoutes } from "react-router-dom";

import { googleAnalyticsId, isProduction } from "@constants";
import { useHubspot } from "@src/hooks";
import { mainRoutes } from "@src/routes";
import { getPageTitleFromPath } from "@utilities";

import {
	useCacheStore,
	useConnectionStore,
	useFileStore,
	useOrganizationStore,
	useProjectStore,
	useTemplatesStore,
} from "@store";

import { PageTitle } from "@components/atoms";
import { LoadingOverlay } from "@components/molecules";

export const App = () => {
	const { t } = useTranslation("global", { keyPrefix: "pageTitles" });
	const { t: tLoadingOverlay } = useTranslation("global", { keyPrefix: "loadingOverlay" });
	const { t: tDashboardLoadingOverlay } = useTranslation("dashboard", { keyPrefix: "loadingOverlay" });
	const location = useLocation();
	const params = useParams<{
		connectionId?: string;
		deploymentId?: string;
		eventId?: string;
		projectId?: string;
		sessionId?: string;
		triggerId?: string;
	}>();
	const { user, currentOrganization: organization, isLoggingOut } = useOrganizationStore();
	const { openFiles } = useFileStore();
	const { isDeleting, isExporting, loadingImportFile } = useProjectStore();
	const { isLoadingFromChatbot } = useConnectionStore();
	const { isLoading: isLoadingTemplates } = useTemplatesStore();
	const [pageTitle, setPageTitle] = useState<string>(t("base"));
	const { setPathPageView } = useHubspot();

	const activeFile = params.projectId
		? openFiles[params.projectId]?.find((f: { isActive: boolean }) => f.isActive)
		: undefined;
	const activeFileName = activeFile?.name;

	const { pageTitle: pageTitleKey, projectName: extractedProjectName } = getPageTitleFromPath(location.pathname);

	useEffect(() => {
		if (isProduction && googleAnalyticsId) {
			ga4.initialize(googleAnalyticsId, {
				testMode: !isProduction,
			});
		}
		useCacheStore.getState().fetchIntegrations(true);
	}, []);

	useEffect(() => {
		const trackPageView = async () => {
			const path = location.pathname + location.search;

			ga4.send({
				hitType: "pageview",
				page: path,
			});

			if (user) {
				setPathPageView(location.pathname);
			}

			let newPageTitle = t("template", { page: t(pageTitleKey) });
			if (extractedProjectName) {
				newPageTitle += ` - ${extractedProjectName}`;
			}
			setPageTitle(newPageTitle);
		};

		trackPageView();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname, user, organization, params, pageTitleKey, activeFileName, extractedProjectName]);

	const mainElement = useRoutes(mainRoutes, location);

	const isLoading =
		isLoggingOut || loadingImportFile || isDeleting || isExporting || isLoadingFromChatbot || isLoadingTemplates;

	const loadingMessageMap: Record<string, string | undefined> = {
		isLoggingOut: tLoadingOverlay("loggingOut"),
		loadingImportFile: tDashboardLoadingOverlay("importingProject"),
		isDeleting: tDashboardLoadingOverlay("deletingProject"),
		isExporting: tDashboardLoadingOverlay("exportingProject"),
		isLoadingFromChatbot: undefined,
		isLoadingTemplates: undefined,
	};

	const loadingStates = {
		isLoggingOut,
		loadingImportFile,
		isDeleting,
		isExporting,
		isLoadingFromChatbot,
		isLoadingTemplates,
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const activeLoadingState = Object.entries(loadingStates).find(([_, isActive]) => isActive);
	const loadingMessage = activeLoadingState ? loadingMessageMap[activeLoadingState[0]] : undefined;

	return (
		<>
			<PageTitle title={pageTitle} />
			{mainElement}
			<LoadingOverlay isLoading={isLoading} message={loadingMessage} />
		</>
	);
};
