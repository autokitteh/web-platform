import { useLocation, useNavigate } from "react-router-dom";

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

export const useNavigateWithSettings = () => {
	const navigate = useNavigate();
	const location = useLocation();

	return (to: string, options?: { replace?: boolean }) => {
		const { basePath, settingsPath } = extractSettingsPath(location.pathname);
		const cleanBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;

		let newBasePath: string;

		if (to.startsWith("/")) {
			const pageMatch = to.match(/\/([^/]+)$/);
			const pageName = pageMatch ? pageMatch[1] : to;
			const projectBasePath = cleanBasePath.split("/").slice(0, -1).join("/");
			newBasePath = `${projectBasePath}/${pageName}`;
		} else {
			newBasePath = `${cleanBasePath}/${to}`;
		}

		const finalPath = settingsPath ? `${newBasePath}/${settingsPath}` : newBasePath;

		navigate(finalPath, options);
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
