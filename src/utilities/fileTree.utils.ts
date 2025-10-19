import { TreeItem } from "react-complex-tree";

interface FileNode {
	isFolder: boolean;
	children: string[];
	name: string;
}

export const buildFileTree = (filePaths: string[]): Record<string, TreeItem> => {
	const tree: Record<string, TreeItem> = {
		root: {
			index: "root",
			isFolder: true,
			children: [],
			data: "Project Files",
		},
	};

	const folderMap: Record<string, FileNode> = {
		root: {
			isFolder: true,
			children: [],
			name: "",
		},
	};

	filePaths.forEach((filePath) => {
		const parts = filePath.split("/");
		let currentPath = "";

		parts.forEach((part, index) => {
			const isLastPart = index === parts.length - 1;
			const parentPath = currentPath || "root";
			currentPath = currentPath ? `${currentPath}/${part}` : part;

			if (!tree[currentPath]) {
				if (isLastPart) {
					tree[currentPath] = {
						index: currentPath,
						isFolder: false,
						data: part,
					};
				} else {
					tree[currentPath] = {
						index: currentPath,
						isFolder: true,
						children: [],
						data: part,
					};
					folderMap[currentPath] = {
						isFolder: true,
						children: [],
						name: part,
					};
				}

				if (folderMap[parentPath]) {
					if (!folderMap[parentPath].children.includes(currentPath)) {
						folderMap[parentPath].children.push(currentPath);
						if (tree[parentPath].children) {
							tree[parentPath].children = [...(tree[parentPath].children || []), currentPath];
						}
					}
				}
			}
		});
	});

	const sortTreeChildren = (items: Record<string, TreeItem>): Record<string, TreeItem> => {
		Object.keys(items).forEach((key) => {
			if (items[key].isFolder && items[key].children) {
				items[key].children = items[key].children!.sort((a, b) => {
					const aIsFolder = items[a]?.isFolder || false;
					const bIsFolder = items[b]?.isFolder || false;

					if (aIsFolder && !bIsFolder) return -1;
					if (!aIsFolder && bIsFolder) return 1;

					const aName = (items[a]?.data as string) || "";
					const bName = (items[b]?.data as string) || "";
					return aName.localeCompare(bName);
				});
			}
		});
		return items;
	};

	return sortTreeChildren(tree);
};
