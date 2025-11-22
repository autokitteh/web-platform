export interface TreeNode {
	name: string;
	path: string;
	isFolder: boolean;
	children?: TreeNode[];
	depth: number;
}

export const buildFileTree = (filePaths: string[]): TreeNode[] => {
	const allNodes: Record<string, TreeNode> = {};

	filePaths.forEach((filePath) => {
		const parts = filePath.split("/");
		let currentPath = "";

		parts.forEach((part, index) => {
			const isLastPart = index === parts.length - 1;
			const parentPath = currentPath;
			currentPath = currentPath ? `${currentPath}/${part}` : part;

			if (!allNodes[currentPath]) {
				allNodes[currentPath] = {
					name: part,
					path: currentPath,
					isFolder: !isLastPart,
					depth: index,
					children: isLastPart ? undefined : [],
				};
			}

			if (parentPath && allNodes[parentPath] && allNodes[parentPath].children) {
				const parentChildren = allNodes[parentPath].children!;
				if (!parentChildren.find((child) => child.path === currentPath)) {
					parentChildren.push(allNodes[currentPath]);
				}
			}
		});
	});

	const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
		const sorted = nodes.sort((a, b) => {
			if (a.isFolder && !b.isFolder) return -1;
			if (!a.isFolder && b.isFolder) return 1;
			return a.name.localeCompare(b.name);
		});

		sorted.forEach((node) => {
			if (node.children) {
				node.children = sortNodes(node.children);
			}
		});

		return sorted;
	};

	const rootNodes = Object.values(allNodes).filter((node) => node.depth === 0);
	return sortNodes(rootNodes);
};

/**
 * Calculates the longest file name from a file tree structure
 * @param treeData - Array of TreeNode objects representing the file tree
 * @returns The length of the longest file name
 */
export const getLongestFileNameLength = (treeData: TreeNode[]): number => {
	let maxLength = 0;

	const traverse = (nodes: TreeNode[]) => {
		nodes.forEach((node) => {
			if (!node.isFolder) {
				maxLength = Math.max(maxLength, node.name.length);
			}
			if (node.children) {
				traverse(node.children);
			}
		});
	};

	traverse(treeData);
	return maxLength;
};
