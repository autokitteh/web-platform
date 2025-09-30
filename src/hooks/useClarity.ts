import { useEffect } from "react";

import { useLocation } from "react-router-dom";

import { useOrganizationStore } from "@src/store";
import { getPageTitleFromPath } from "@src/utilities";
import { setClarityPageId, setClarityProjectName } from "@utilities/clarity.utils";

export const useClarity = () => {
	const location = useLocation();
	const { user, currentOrganization: organization } = useOrganizationStore();
	const { pageTitle: pageTitleKey, projectName } = getPageTitleFromPath(location.pathname);

	useEffect(() => {
		const setPage = async () => {
			if (window.clarity) {
				if (user && organization) {
					await setClarityPageId({
						userId: user.id,
						userName: user.name,
						userEmail: user.email,
						pageTitleKey,
					});
					if (!projectName) return;
					await setClarityProjectName(projectName);
				}
			}
		};
		setPage();
	}, [location]);
};
