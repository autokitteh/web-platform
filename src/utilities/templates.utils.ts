import { t } from "i18next";
import { load } from "js-yaml";

import { TemplateStorageService, TourStorageService } from "@services";
import { defaultManifestFile, defaultProjectName, namespaces } from "@src/constants";
import { templateStorage } from "@src/services/indexedDB/templatesIndexedDb.service";
import { LoggerService } from "@src/services/logger.service";

export const parseTemplateManifestAndFiles = async (
	assetDirectory: string,
	storage: TemplateStorageService | TourStorageService,
	projectName?: string,
	removeManifestFromFiles?: boolean
): Promise<{ files: Record<string, string>; manifest: object } | null> => {
	const files = await storage.getFiles(assetDirectory);
	const manifestData = files?.[defaultManifestFile];
	if (!manifestData) {
		return null;
	}

	const manifestObject = load(manifestData) as {
		project?: { name: string };
	};

	if (projectName && manifestObject.project) {
		manifestObject.project.name = projectName;
	}

	if (removeManifestFromFiles) {
		delete files[defaultManifestFile];
	}

	return { manifest: manifestObject, files };
};

export const extractProjectNameFromTemplateAsset = (templateAssetDirectory: string): string =>
	templateAssetDirectory ? templateAssetDirectory.split("/").pop() || templateAssetDirectory : defaultProjectName;

export const validateTemplatesExistInIndexedDB = async (): Promise<boolean> => {
	try {
		const localStorageTemplates = await templateStorage.getAllRecords();

		if (!localStorageTemplates || Object.keys(localStorageTemplates).length === 0) {
			return false;
		}

		const hasTemplates = Object.keys(localStorageTemplates).length > 0;

		return hasTemplates;
	} catch (error) {
		LoggerService.error(
			namespaces.utilities.templatesUtilities,
			t("templates.validationError", {
				error: (error as Error).message,
				ns: "utilities",
			})
		);
		return false;
	}
};

export const validateAllTemplatesExist = async (
	templateMap: Record<string, any>,
	sortedCategories?: any[]
): Promise<boolean> => {
	try {
		const stateHasTemplates = !!(templateMap && Object.keys(templateMap).length > 0);
		const stateHasCategories = !!(sortedCategories && sortedCategories.length > 0);
		const indexedDBHasTemplates = await validateTemplatesExistInIndexedDB();

		return stateHasTemplates && stateHasCategories && indexedDBHasTemplates;
	} catch (error) {
		LoggerService.error(
			namespaces.utilities.templatesUtilities,
			t("templates.validationError", {
				error: (error as Error).message,
				ns: "utilities",
			})
		);
		return false;
	}
};
