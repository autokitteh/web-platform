import { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { isProduction, msClarityId } from "@constants";
import { useOrganizationStore } from "@src/store";
import { getPageTitleFromPath } from "@src/utilities";
import { setClarityPageId } from "@utilities/clarity.utils";

export const useClarity = () => {
	const { t } = useTranslation("utilities");
	const location = useLocation();
	const { user, currentOrganization: organization } = useOrganizationStore();
	const { pageTitle: pageTitleKey } = getPageTitleFromPath(location.pathname);

	useEffect(() => {
		const setPage = async () => {
			const isClarityInitialized = window.clarity && isProduction && msClarityId;

			if (!isClarityInitialized) {
				// eslint-disable-next-line no-console
				console.warn(t("clarity.notInitialized"));
				return;
			}

			if (user && organization) {
				await setClarityPageId({
					userId: user.id,
					userName: user.name,
					userEmail: user.email,
					pageTitleKey,
				});
			} else {
				// eslint-disable-next-line no-console
				console.warn(t("clarity.noAuthenticatedUser"));
			}
		};
		setPage();
	}, [location, user, organization, pageTitleKey, t]);
};
