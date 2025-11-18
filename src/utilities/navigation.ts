import type { NavigateFunction } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

import { ProjectLocationState } from "@src/types/global";

const settingsRegex =
	// eslint-disable-next-line security/detect-unsafe-regex
	/\/(settings(?:\/(?:connections|variables|triggers)(?:\/(?:new|[a-zA-Z0-9_-]+\/(?:edit|delete)))?)?)(?:\/|$)/;

export const extractSettingsPath = (pathname: string): { basePath: string; settingsPath: string | null } => {
	const match = pathname.match(settingsRegex);

	if (match) {
		const settingsIndex = match.index!;
		const basePath = pathname.slice(0, settingsIndex);
		const settingsPath = pathname.slice(settingsIndex + 1);

		return { basePath, settingsPath };
	}

	return { basePath: pathname, settingsPath: null };
};

export const navigateToProject = (
	navigate: NavigateFunction,
	projectId: string,
	pathSuffix: string = "/explorer",
	state: ProjectLocationState = {}
) => {
	const hasState = Object.keys(state).length > 0;

	navigate(`/projects/${projectId}${pathSuffix}`, hasState ? { state } : undefined);
};

export const useNavigateWithSettings = () => {
	const navigate = useNavigate();
	const location = useLocation();

	return (to: string, options?: { replace?: boolean; state?: ProjectLocationState }) => {
		const currentPath = location.pathname;
		const { basePath, settingsPath } = extractSettingsPath(currentPath);
		const cleanBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;

		let newBasePath: string;

		if (to.startsWith("/projects/")) {
			newBasePath = to;
		} else if (to.startsWith("/")) {
			const pageMatch = to.match(/\/([^/]+)$/);
			const pageName = pageMatch ? pageMatch[1] : to;
			const projectBasePath = cleanBasePath.split("/").slice(0, -1).join("/");
			newBasePath = `${projectBasePath}/${pageName}`;
		} else {
			const projectPageMatch = cleanBasePath.match(/^\/projects\/[^/]+$/);
			if (
				projectPageMatch &&
				!currentPath.includes("/explorer") &&
				!currentPath.includes("/sessions") &&
				!currentPath.includes("/deployments")
			) {
				newBasePath = `${cleanBasePath}/explorer/${to}`;
			} else {
				newBasePath = `${cleanBasePath}/${to}`;
			}
		}

		let finalPath: string;
		if (settingsPath) {
			const queryIndex = newBasePath.indexOf("?");
			if (queryIndex !== -1) {
				const pathPart = newBasePath.slice(0, queryIndex);
				const queryPart = newBasePath.slice(queryIndex);
				finalPath = `${pathPart}/${settingsPath}${queryPart}`;
			} else {
				finalPath = `${newBasePath}/${settingsPath}`;
			}
		} else {
			finalPath = newBasePath;
		}

		navigate(finalPath, { ...options, state: { ...options?.state } });
	};
};

export const useCloseSettings = () => {
	const navigate = useNavigate();
	const location = useLocation();

	return (options?: { replace?: boolean }) => {
		const { basePath } = extractSettingsPath(location.pathname);
		navigate(basePath, options);
	};
};
