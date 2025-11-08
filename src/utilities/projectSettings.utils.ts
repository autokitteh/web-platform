import { projectExplorerSettingsSectionPathPattern } from "@constants";
import { ProjectSettingsSection } from "@src/types/global";

const projectSettingsSectionRegex = /\/settings\/([^/]+)/;

const hasRequiredProjectSettingsPath = (pathname: string): boolean => {
	const normalizedPath = pathname.replace(/\/+$/, "");

	return projectExplorerSettingsSectionPathPattern.test(normalizedPath);
};

export const getProjectSettingsSectionFromPath = (pathname: string): ProjectSettingsSection | undefined => {
	if (!hasRequiredProjectSettingsPath(pathname)) {
		return;
	}

	const match = pathname.match(projectSettingsSectionRegex);

	if (!match) {
		return undefined;
	}

	const section = match[1] as ProjectSettingsSection;

	if (section === "connections" || section === "triggers" || section === "variables") {
		return section;
	}

	return undefined;
};
