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

/**
 * Calculates the optimal width for the split frame based on the longest file name
 * @param filePaths - Array of file paths
 * @param maxWidth - Maximum allowed width (default: 35)
 * @param minWidth - Minimum allowed width (default: 15)
 * @returns Calculated width percentage
 */
export const calculateOptimalSplitFrameWidth = (
	filePaths: string[],
	maxWidth: number = 35,
	minWidth: number = 15
): number => {
	if (filePaths.length === 0) {
		return minWidth;
	}

	const treeData = buildFileTree(filePaths);
	const longestFileNameLength = getLongestFileNameLength(treeData);

	// More precise calculation to prevent truncation without being too wide:
	// - Use 0.6% per character for tighter spacing
	// - Add padding for icons, spacing, and scrollbar
	const calculatedWidth = Math.min(
		longestFileNameLength * 0.8 + 6, // Tighter: 0.8% per character + 6% padding
		maxWidth
	);

	return Math.max(calculatedWidth, minWidth);
};
