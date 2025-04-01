import { walkthroughStorage } from "@services/walkthroughIndexedDb.service";

export const processWalkthroughs = async (structure?: Record<string, any>) => {
	if (!structure) return;

	const walkthroughs: Record<string, string> = {};
	const walkthroughsDir = "walkthroughs";

	const walkthroughPromises = Object.entries(structure).map(async ([path, content]) => {
		if (path.startsWith(walkthroughsDir) && typeof content === "object") {
			const walkthroughId = path.split("/").pop();
			if (walkthroughId) {
				walkthroughs[walkthroughId] = path;

				const files: Record<string, string> = {};
				Object.entries(content).forEach(([filePath, fileContent]) => {
					if (typeof fileContent === "string") {
						files[filePath] = fileContent;
					}
				});

				if (Object.keys(files).length > 0) {
					await walkthroughStorage.storeWalkthroughFiles(walkthroughId, files);
				}
			}
		}
	});

	await Promise.all(walkthroughPromises);

	return walkthroughs;
};
