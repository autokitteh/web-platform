export const settingsPathPattern = {
	base: "settings",
	children: ["connections", "variables", "triggers"],
	deepChildren: ["new", "edit", "delete"],
} as const;

export const parseSettingsPath = (pathname: string): { basePath: string; settingsPath: string | null } => {
	const settingsIndex = pathname.indexOf("/settings");

	if (settingsIndex === -1) {
		return { basePath: pathname, settingsPath: null };
	}

	const basePath = pathname.slice(0, settingsIndex);
	const remainder = pathname.slice(settingsIndex + 1);

	const endIndex = remainder.search(/[?#]/);
	const settingsPath = endIndex === -1 ? remainder : remainder.slice(0, endIndex);

	return { basePath, settingsPath };
};

export const getProjectBasePath = (pathname: string): string => {
	const match = pathname.match(/^\/projects\/[^/]+/);
	return match ? match[0] : pathname;
};

export const isValidSettingsPath = (path: string): boolean => {
	if (!path.startsWith("settings")) return false;
	const parts = path.split("/").filter(Boolean);
	if (parts.length === 1) return true;
	if (parts.length > 1 && !settingsPathPattern.children.includes(parts[1] as any)) return false;
	return true;
};

export const insertBeforeQuery = (basePath: string, settingsPath: string): string => {
	const queryIndex = basePath.indexOf("?");
	if (queryIndex === -1) {
		return `${basePath}/${settingsPath}`;
	}
	const pathPart = basePath.slice(0, queryIndex);
	const queryPart = basePath.slice(queryIndex);
	return `${pathPart}/${settingsPath}${queryPart}`;
};
