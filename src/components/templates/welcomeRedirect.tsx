import { ReactNode, useEffect } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { useOrganizationStore, useProjectStore } from "@store";

export const WelcomeRedirect = ({ children }: { children: ReactNode }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useOrganizationStore();
	const { projectsList, isLoadingProjectsList } = useProjectStore();

	useEffect(() => {
		if (!user || isLoadingProjectsList) {
			return;
		}

		const isRootPath = location.pathname === "/";
		const hasProjects = projectsList && projectsList.length > 0;

		if (isRootPath && !hasProjects) {
			navigate("/welcome", { replace: true });
		}
	}, [user, projectsList, isLoadingProjectsList, location.pathname, navigate]);

	return children;
};
