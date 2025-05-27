import { load } from "js-yaml";

import { TemplateStorageService, TourStorageService } from "@services";
import { defaultManifestFile, defaultProjectName } from "@src/constants";

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
