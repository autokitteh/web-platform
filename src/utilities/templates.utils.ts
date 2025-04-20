import { load } from "js-yaml";

import { TemplateStorageService, TourStorageService } from "@services";

export const parseTemplateManifestAndFiles = async (
	assetDirectory: string,
	storage: TemplateStorageService | TourStorageService,
	projectName?: string,
	removeManifestFromFiles?: boolean
): Promise<{ files: Record<string, string>; manifest: object } | null> => {
	const files = await storage.getFiles(assetDirectory);
	const manifestData = files?.["autokitteh.yaml"];
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
		delete files["autokitteh.yaml"];
	}

	return { manifest: manifestObject, files };
};
