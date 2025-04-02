import { getTourStorage } from "@services/tourIndexedDb.service";

export const processToursFromTemplates = async (structure?: Record<string, any>) => {
	if (!structure) return;

	const tours: Record<string, string> = {};
	const toursDir = "tours";

	const tourPromises = Object.entries(structure).map(async ([path, content]) => {
		if (path.startsWith(toursDir) && typeof content === "object") {
			const tourId = path.split("/").pop();
			if (tourId) {
				tours[tourId] = path;

				const files: Record<string, string> = {};
				Object.entries(content).forEach(([filePath, fileContent]) => {
					if (typeof fileContent === "string") {
						files[filePath] = fileContent;
					}
				});

				if (Object.keys(files).length > 0) {
					await getTourStorage().storeTourFiles(tourId, files);
				}
			}
		}
	});

	await Promise.all(tourPromises);

	return tours;
};
