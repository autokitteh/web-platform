import { useEffect } from "react";

import { useLocation } from "react-router-dom";

import { useOrganizationStore } from "@src/store";
import { getPageTitleFromPath } from "@src/utilities";
import { setClarityPageId } from "@utilities/clarity.utils";

export const useClarity = () => {
	const location = useLocation();
	const { user, currentOrganization: organization } = useOrganizationStore();
	const { pageTitle: pageTitleKey } = getPageTitleFromPath(location.pathname);

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
				}
			}
		};
		setPage();
	}, [location]);
};
