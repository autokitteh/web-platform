import { tourStorage } from "@services";

const isDirectoryNode = (node: any): node is { children: Record<string, any>; type: string } =>
	node?.type === "directory";

const isFileNode = (node: any): node is { content: string; path: string; type: string } => node?.type === "file";

export const processToursFromTemplates = async (structure?: Record<string, any>) => {
	if (!structure) return;

	const tours: Record<string, string> = {};
	const toursDir = "walkthroughs";
	const storagePromises: Promise<void>[] = [];

	const processDirectory = (dirStructure: Record<string, any>, currentPath: string = "") => {
		for (const [name, node] of Object.entries(dirStructure)) {
			if (!node) continue;

			const fullPath = currentPath ? `${currentPath}/${name}` : name;

			if (isDirectoryNode(node)) {
				if (currentPath.startsWith(toursDir)) {
					const tourId = name;
					tours[tourId] = fullPath;

					const files: Record<string, string> = {};
					Object.entries(node.children).forEach(([filePath, fileNode]) => {
						if (isFileNode(fileNode)) {
							files[filePath] = fileNode.content;
						}
					});

					if (Object.keys(files).length > 0) {
						storagePromises.push(tourStorage.storeTourFiles(tourId, files));
					}
				} else {
					processDirectory(node.children, fullPath);
				}
			}
		}
	};

	processDirectory(structure);
	await Promise.all(storagePromises);

	return tours;
};
