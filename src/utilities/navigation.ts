import type { NavigateFunction } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

import { parseSettingsPath, insertBeforeQuery, getProjectBasePath } from "./pathParser";
import { ProjectLocationState } from "@src/types/global";

export const extractSettingsPath = (pathname: string) => {
	return parseSettingsPath(pathname);
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

const isProjectRootPage = (currentPath: string): boolean => {
	const projectRootPattern = /^\/projects\/[^/]+$/;
	return projectRootPattern.test(currentPath);
};

const resolvePagePath = (to: string, currentPath: string): string => {
	const pageName = to.replace(/^\//, "").split("/")[0];
	const projectBase = getProjectBasePath(currentPath);
	return `${projectBase}/${pageName}`;
};

const resolveRelativePath = (to: string, basePathClean: string, isProjectRoot: boolean): string => {
	if (isProjectRoot) {
		return `${basePathClean}/explorer/${to}`;
	}
	return `${basePathClean}/${to}`;
};

const resolvePath = (to: string, currentBasePath: string, currentPath: string, settingsPath: string | null): string => {
	if (to.startsWith("/projects/")) {
		return to;
	}

	const basePathClean = currentBasePath.endsWith("/") ? currentBasePath.slice(0, -1) : currentBasePath;

	const newBasePath = to.startsWith("/")
		? resolvePagePath(to, currentPath)
		: resolveRelativePath(to, basePathClean, isProjectRootPage(currentPath));

	return settingsPath ? insertBeforeQuery(newBasePath, settingsPath) : newBasePath;
};

export const useProjectNavigation = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const navigateWithSettings = (to: string, options?: { replace?: boolean; state?: ProjectLocationState }): void => {
		const currentPath = location.pathname;
		const { basePath, settingsPath } = parseSettingsPath(currentPath);
		const newPath = resolvePath(to, basePath, currentPath, settingsPath);
		navigate(newPath, { ...options, state: { ...options?.state } });
	};

	const closeSettings = (options?: { replace?: boolean }): void => {
		const { basePath } = parseSettingsPath(location.pathname);
		navigate(basePath, options);
	};

	return { navigateWithSettings, closeSettings };
};

export const useNavigateWithSettings = () => {
	const { navigateWithSettings } = useProjectNavigation();
	return navigateWithSettings;
};

export const useCloseSettings = () => {
	const { closeSettings } = useProjectNavigation();
	return closeSettings;
};
