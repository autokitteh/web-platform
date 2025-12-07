import type { NavigateFunction } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";

import { ProjectLocationState } from "@src/types/global";

const PROJECT_PAGES = ["explorer", "sessions", "deployments"] as const;
const SETTINGS_REGEX =
	/\/(settings(?:\/(?:connections|variables|triggers)(?:\/(?:new|[a-zA-Z0-9_-]+\/(?:edit|delete)))?)?)(?:\/|$)/;

const removeTrailingSlash = (path: string): string => (path.endsWith("/") ? path.slice(0, -1) : path);

const ensureNoDoubleSlash = (path: string): string => path.replace(/\/+/g, "/");

const isFullProjectPath = (path: string): boolean => path.startsWith("/projects/");

const isAbsolutePath = (path: string): boolean => path.startsWith("/");

const getLastSegment = (path: string): string => {
	const match = path.match(/\/([^/]+)$/);

	return match ? match[1] : path;
};

const getProjectIdFromPath = (path: string): string | null => {
	const match = path.match(/^\/projects\/([^/]+)/);

	return match ? match[1] : null;
};

const hasProjectPage = (path: string): boolean => PROJECT_PAGES.some((page) => path.includes(`/${page}`));

export const extractSettingsPath = (pathname: string): { basePath: string; settingsPath: string | null } => {
	const match = pathname.match(SETTINGS_REGEX);

	if (!match || match.index === undefined) {
		return { basePath: pathname, settingsPath: null };
	}

	const basePath = pathname.slice(0, match.index);
	const settingsPath = pathname.slice(match.index + 1);

	return { basePath, settingsPath };
};

const resolveNewBasePath = (to: string, currentBasePath: string): string => {
	const cleanBasePath = removeTrailingSlash(currentBasePath);
	const projectId = getProjectIdFromPath(cleanBasePath);

	if (isFullProjectPath(to)) {
		return to;
	}

	if (isAbsolutePath(to)) {
		const pageName = getLastSegment(to);
		if (!projectId) {
			return to;
		}

		return `/projects/${projectId}/${pageName}`;
	}

	if (projectId && !hasProjectPage(cleanBasePath)) {
		return `/projects/${projectId}/explorer/${to}`;
	}

	return `${cleanBasePath}/${to}`;
};

const appendSettingsToPath = (basePath: string, settingsPath: string | null): string => {
	if (!settingsPath) {
		return basePath;
	}

	const queryIndex = basePath.indexOf("?");
	if (queryIndex !== -1) {
		const pathPart = basePath.slice(0, queryIndex);
		const queryPart = basePath.slice(queryIndex);

		return `${pathPart}/${settingsPath}${queryPart}`;
	}

	return `${basePath}/${settingsPath}`;
};

export const navigateToProject = (
	navigate: NavigateFunction,
	projectId: string,
	pathSuffix: string = "/explorer",
	state: ProjectLocationState = {}
) => {
	const hasState = Object.keys(state).length > 0;
	const path = ensureNoDoubleSlash(`/projects/${projectId}${pathSuffix}`);

	navigate(path, hasState ? { state } : undefined);
};

export const useNavigateWithSettings = () => {
	const navigate = useNavigate();
	const location = useLocation();

	return (to: string, options?: { replace?: boolean; state?: ProjectLocationState }) => {
		const { basePath, settingsPath } = extractSettingsPath(location.pathname);

		const newBasePath = resolveNewBasePath(to, basePath);
		const finalPath = appendSettingsToPath(newBasePath, settingsPath);
		const cleanPath = ensureNoDoubleSlash(finalPath);

		const hasState = options?.state && Object.keys(options.state).length > 0;
		const navigationOptions = hasState
			? { ...options, state: options.state }
			: options?.replace
				? { replace: options.replace }
				: undefined;

		navigate(cleanPath, navigationOptions);
	};
};

export const useCloseSettings = () => {
	const navigate = useNavigate();
	const location = useLocation();

	return (options?: { replace?: boolean }) => {
		const { basePath } = extractSettingsPath(location.pathname);
		navigate(basePath || "/", options);
	};
};
