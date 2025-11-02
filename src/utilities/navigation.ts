import { useLocation, useNavigate } from "react-router-dom";

const settingsRegex =
	/\/(settings(?:\/(?:connections|variables|triggers)(?:\/(?:new|[^/]+\/(?:edit|delete)))?)?)(?:\/|$)/;

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
		const newBasePath = to.startsWith("/") ? to : `${cleanBasePath}/${to}`;

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
