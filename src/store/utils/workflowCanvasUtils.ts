import { XYPosition } from "@xyflow/react";

import {
	WorkflowNode,
	WorkflowEdge,
	LayoutConfig,
	FileNodeData,
} from "@interfaces/store/workflowCanvasStore.interface";

/**
 * Generates a unique node ID for drag-and-drop operations.
 * Uses a combination of type and timestamp to ensure uniqueness.
 */
export const generateNodeId = (type: string): string => {
	return `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Parses the programming language from a file name based on its extension.
 * This helps determine syntax highlighting and function extraction logic.
 */
export const parseFileLanguage = (fileName: string): FileNodeData["language"] => {
	const extension = fileName.split(".").pop()?.toLowerCase();

	switch (extension) {
		case "py":
			return "python";
		case "js":
			return "javascript";
		case "ts":
		case "tsx":
			return "typescript";
		case "star":
			return "starlark";
		case "yaml":
		case "yml":
			return "yaml";
		default:
			return "unknown";
	}
};

/**
 * Extracts function names from file content based on the language.
 * This enables showing available entry points in file nodes.
 *
 * For Python: looks for `def function_name(`
 * For JavaScript/TypeScript: looks for various function declaration patterns
 */
export const extractFunctionsFromContent = (content: string, language: FileNodeData["language"]): string[] => {
	if (!content) return [];

	const functions: string[] = [];

	switch (language) {
		case "python":
		case "starlark": {
			// Match Python/Starlark function definitions
			// Pattern: def function_name(
			const pythonFuncRegex = /^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gm;
			let match;
			while ((match = pythonFuncRegex.exec(content)) !== null) {
				// Skip private functions (starting with underscore) unless they're handlers
				if (!match[1].startsWith("_") || match[1].startsWith("on_")) {
					functions.push(match[1]);
				}
			}
			break;
		}

		case "javascript":
		case "typescript": {
			// Match various JavaScript/TypeScript function patterns:
			// 1. function name(
			// 2. const name = (
			// 3. const name = async (
			// 4. export function name(
			// 5. export const name = (
			// eslint-disable-next-line security/detect-unsafe-regex
			const jsFuncRegex = /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/gm;
			// eslint-disable-next-line security/detect-unsafe-regex
			const jsArrowRegex = /(?:export\s+)?(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\(/gm;

			let match;
			while ((match = jsFuncRegex.exec(content)) !== null) {
				functions.push(match[1]);
			}
			while ((match = jsArrowRegex.exec(content)) !== null) {
				functions.push(match[1]);
			}
			break;
		}

		default:
			// For unknown languages, return empty array
			break;
	}

	// Remove duplicates while preserving order
	return [...new Set(functions)];
};

/**
 * Default layout configuration for auto-arranging nodes.
 * Uses a left-to-right flow that mirrors typical workflow direction.
 */
const defaultLayoutConfig: LayoutConfig = {
	direction: "LR", // Left to Right flow
	nodeSpacing: 80, // Horizontal gap between nodes
	rankSpacing: 200, // Vertical gap between ranks/columns
	marginX: 50, // Left margin
	marginY: 50, // Top margin
};

/**
 * Calculates the dimensions for different node types.
 * File nodes are larger because they display more information.
 */
const getNodeDimensions = (node: WorkflowNode): { height: number; width: number } => {
	switch (node.type) {
		case "connection":
			return { width: 200, height: 80 };
		case "file": {
			// File nodes need more height if they have many functions
			const fileData = node.data as FileNodeData;
			const functionsCount = fileData.functions?.length || 0;
			return { width: 220, height: 100 + Math.min(functionsCount * 24, 120) };
		}
		case "trigger":
			return { width: 180, height: 70 };
		case "variable":
			return { width: 160, height: 60 };
		default:
			return { width: 180, height: 80 };
	}
};

/**
 * Groups nodes by their type for organized layout.
 * This creates visual columns for connections, triggers, files, and variables.
 */
const groupNodesByType = (nodes: WorkflowNode[]): Map<string, WorkflowNode[]> => {
	const groups = new Map<string, WorkflowNode[]>();

	nodes.forEach((node) => {
		const type = node.type || "unknown";
		if (!groups.has(type)) {
			groups.set(type, []);
		}
		groups.get(type)!.push(node);
	});

	return groups;
};

/**
 * Calculates automatic layout positions for all nodes.
 * Organizes nodes in columns by type: connections -> triggers -> files -> variables
 * This creates a clear left-to-right workflow visualization.
 */
export const calculateAutoLayout = (
	nodes: WorkflowNode[],
	_edges: WorkflowEdge[],
	config: Partial<LayoutConfig> = {}
): WorkflowNode[] => {
	if (nodes.length === 0) return nodes;

	const layoutConfig = { ...defaultLayoutConfig, ...config };
	const { nodeSpacing, rankSpacing, marginX, marginY } = layoutConfig;

	// Group nodes by type for column-based layout
	const groups = groupNodesByType(nodes);

	// Define column order (left to right flow)
	const columnOrder = ["connection", "trigger", "file", "variable"];

	// Track positions for each column
	let currentX = marginX;
	const positionedNodes: WorkflowNode[] = [];

	columnOrder.forEach((type) => {
		const typeNodes = groups.get(type) || [];
		if (typeNodes.length === 0) return;

		// Calculate max width for this column
		let maxWidth = 0;
		let currentY = marginY;

		typeNodes.forEach((node) => {
			const dimensions = getNodeDimensions(node);
			maxWidth = Math.max(maxWidth, dimensions.width);

			// Position the node
			const positionedNode: WorkflowNode = {
				...node,
				position: { x: currentX, y: currentY },
			};
			positionedNodes.push(positionedNode);

			// Move Y position for next node in column
			currentY += dimensions.height + nodeSpacing;
		});

		// Move to next column
		currentX += maxWidth + rankSpacing;
	});

	// Handle any nodes not in the standard types
	const standardTypes = new Set(columnOrder);
	nodes.forEach((node) => {
		if (!standardTypes.has(node.type || "")) {
			const existing = positionedNodes.find((n) => n.id === node.id);
			if (!existing) {
				positionedNodes.push({
					...node,
					position: { x: currentX, y: marginY },
				});
			}
		}
	});

	return positionedNodes;
};

/**
 * Checks if two nodes can be connected based on their types.
 * Defines the valid connection rules for the workflow.
 */
export const canConnect = (sourceType: string, targetType: string): boolean => {
	// Define valid connections as source -> allowed targets
	const validConnections: Record<string, string[]> = {
		connection: ["trigger"], // Connections can only connect to triggers
		trigger: ["file"], // Triggers connect to files (entry points)
		file: ["file"], // Files can import/call other files
		variable: [], // Variables don't connect to anything visually
	};

	const allowedTargets = validConnections[sourceType] || [];
	return allowedTargets.includes(targetType);
};

/**
 * Generates a human-readable label for an edge based on its data.
 */
export const getEdgeLabel = (edge: WorkflowEdge): string => {
	if (edge.label) return edge.label as string;
	if (edge.data?.label) return edge.data.label;
	return "";
};

/**
 * Finds all nodes connected to a given node (both incoming and outgoing).
 * Useful for highlighting related nodes on selection.
 */
export const getConnectedNodes = (
	nodeId: string,
	edges: WorkflowEdge[]
): { incoming: string[]; outgoing: string[] } => {
	const incoming: string[] = [];
	const outgoing: string[] = [];

	edges.forEach((edge) => {
		if (edge.source === nodeId) {
			outgoing.push(edge.target);
		}
		if (edge.target === nodeId) {
			incoming.push(edge.source);
		}
	});

	return { incoming, outgoing };
};

/**
 * Centers the canvas view on a specific node.
 * Returns the viewport transform needed to center on the node.
 */
export const getViewportForNode = (
	node: WorkflowNode,
	canvasWidth: number,
	canvasHeight: number,
	zoom: number = 1
): { x: number; y: number; zoom: number } => {
	const dimensions = getNodeDimensions(node);

	return {
		x: canvasWidth / 2 - (node.position.x + dimensions.width / 2) * zoom,
		y: canvasHeight / 2 - (node.position.y + dimensions.height / 2) * zoom,
		zoom,
	};
};

/**
 * Creates a new node from drag-and-drop data.
 * Positions it at the drop location and generates a unique ID.
 */
export const createNodeFromDrop = (
	type: string,
	position: XYPosition,
	data: Partial<Record<string, unknown>>
): WorkflowNode => {
	return {
		id: generateNodeId(type),
		type: type as WorkflowNode["type"],
		position,
		data: data as unknown as WorkflowNode["data"],
	};
};
