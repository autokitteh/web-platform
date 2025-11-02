import React, { useEffect, useState } from "react";

import ga4 from "react-ga4";
import { useTranslation } from "react-i18next";
import {
	useLocation,
	useParams,
	createRoutesFromChildren,
	matchRoutes,
	useNavigationType,
	useRoutes,
} from "react-router-dom";

import { googleAnalyticsId, isProduction, sentryDsn } from "@constants";
import { useHubspot } from "@src/hooks";
import { mainRoutes } from "@src/routes";
import { getPageTitleFromPath } from "@utilities";

import { useFileStore, useOrganizationStore } from "@store";

import { PageTitle } from "@components/atoms";

export const App = () => {
	const { t } = useTranslation("global", { keyPrefix: "pageTitles" });
	const location = useLocation();
	const params = useParams<{
		connectionId?: string;
		deploymentId?: string;
		eventId?: string;
		projectId?: string;
		sessionId?: string;
		triggerId?: string;
	}>();
	const { user, currentOrganization: organization } = useOrganizationStore();

	const { openFiles } = useFileStore();
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
	// const drawerElement = useRoutes(drawerRoutes, location);

	return (
		<>
			<PageTitle title={pageTitle} />
			{mainElement}
			{/* {drawerElement} */}
		</>
	);
};
