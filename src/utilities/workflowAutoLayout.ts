import { XYPosition } from "@xyflow/react";

import {
	WorkflowNode,
	WorkflowEdge,
	TriggerNode,
	CodeNode,
	ConnectionNode,
} from "@interfaces/components/workflowBuilder.interface";

export interface LayoutConfig {
	nodeSpacing: {
		horizontal: number;
		vertical: number;
	};
	layerGap: number;
	startPosition: {
		x: number;
		y: number;
	};
	alignment: "center" | "left";
	maxNodesPerRow: number;
	nodeWidths: {
		code: number;
		connection: number;
		trigger: number;
	};
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
	nodeSpacing: { horizontal: 220, vertical: 120 },
	layerGap: 180,
	startPosition: { x: 100, y: 50 },
	alignment: "center",
	maxNodesPerRow: 5,
	nodeWidths: {
		trigger: 160,
		code: 200,
		connection: 120,
	},
};

interface LayerInfo {
	nodes: WorkflowNode[];
	yPosition: number;
	layerWidth: number;
}

export function applyAutoLayout(
	nodes: WorkflowNode[],
	edges: WorkflowEdge[],
	config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): WorkflowNode[] {
	if (nodes.length === 0) {
		return nodes;
	}

	const triggerNodes = nodes.filter((n) => n.type === "trigger") as TriggerNode[];
	const codeNodes = nodes.filter((n) => n.type === "code") as CodeNode[];
	const connectionNodes = nodes.filter((n) => n.type === "connection") as ConnectionNode[];

	const orderedCodeNodes = orderCodeNodesByDependencies(codeNodes, edges, triggerNodes);
	const orderedConnectionNodes = orderConnectionsByUsage(connectionNodes, edges, codeNodes);

	const layers: LayerInfo[] = [
		{
			nodes: triggerNodes,
			yPosition: config.startPosition.y,
			layerWidth: calculateLayerWidth(triggerNodes.length, config, "trigger"),
		},
		{
			nodes: orderedCodeNodes,
			yPosition: config.startPosition.y + config.layerGap,
			layerWidth: calculateLayerWidth(orderedCodeNodes.length, config, "code"),
		},
		{
			nodes: orderedConnectionNodes,
			yPosition: config.startPosition.y + config.layerGap * 2,
			layerWidth: calculateLayerWidth(orderedConnectionNodes.length, config, "connection"),
		},
	];

	const maxLayerWidth = Math.max(...layers.map((l) => l.layerWidth));

	const positionedNodes: WorkflowNode[] = [];

	layers.forEach((layer) => {
		const layerNodes = positionNodesInLayer(layer.nodes, layer.yPosition, maxLayerWidth, config);
		positionedNodes.push(...layerNodes);
	});

	return optimizeEdgeCrossings(positionedNodes, edges, config);
}

function calculateLayerWidth(nodeCount: number, config: LayoutConfig, _nodeType: string): number {
	void _nodeType;
	if (nodeCount === 0) {
		return 0;
	}

	const effectiveCount = Math.min(nodeCount, config.maxNodesPerRow);

	return (effectiveCount - 1) * config.nodeSpacing.horizontal;
}

function positionNodesInLayer(
	nodes: WorkflowNode[],
	yPosition: number,
	maxLayerWidth: number,
	config: LayoutConfig
): WorkflowNode[] {
	if (nodes.length === 0) {
		return [];
	}

	const positionedNodes: WorkflowNode[] = [];
	const rows: WorkflowNode[][] = [];

	for (let i = 0; i < nodes.length; i += config.maxNodesPerRow) {
		rows.push(nodes.slice(i, i + config.maxNodesPerRow));
	}

	rows.forEach((rowNodes, rowIndex) => {
		const rowWidth = (rowNodes.length - 1) * config.nodeSpacing.horizontal;
		let startX: number;

		if (config.alignment === "center") {
			startX = config.startPosition.x + (maxLayerWidth - rowWidth) / 2;
		} else {
			startX = config.startPosition.x;
		}

		const rowY = yPosition + rowIndex * config.nodeSpacing.vertical;

		rowNodes.forEach((node, index) => {
			const position: XYPosition = {
				x: startX + index * config.nodeSpacing.horizontal,
				y: rowY,
			};

			positionedNodes.push({
				...node,
				position,
			});
		});
	});

	return positionedNodes;
}

function orderCodeNodesByDependencies(
	codeNodes: CodeNode[],
	edges: WorkflowEdge[],
	triggerNodes: TriggerNode[]
): CodeNode[] {
	if (codeNodes.length <= 1) {
		return codeNodes;
	}

	const nodeScores = new Map<string, number>();

	codeNodes.forEach((node) => {
		const incomingEdges = edges.filter((e) => e.target === node.id);
		const triggersPointingToNode = incomingEdges.filter((e) => triggerNodes.some((t) => t.id === e.source));

		const avgTriggerX =
			triggersPointingToNode.length > 0
				? triggersPointingToNode.reduce((sum, edge) => {
						const trigger = triggerNodes.find((t) => t.id === edge.source);

						return sum + (trigger?.position?.x || 0);
					}, 0) / triggersPointingToNode.length
				: 0;

		const activeEntryPoints = node.data.entryPoints.filter((ep) => ep.isActive).length;
		const connectionCount = node.data.usedConnections.length;

		const score = avgTriggerX * 1000 + activeEntryPoints * 100 + connectionCount;
		nodeScores.set(node.id, score);
	});

	return [...codeNodes].sort((a, b) => {
		const scoreA = nodeScores.get(a.id) || 0;
		const scoreB = nodeScores.get(b.id) || 0;

		return scoreA - scoreB;
	});
}

function orderConnectionsByUsage(
	connectionNodes: ConnectionNode[],
	edges: WorkflowEdge[],
	codeNodes: CodeNode[]
): ConnectionNode[] {
	if (connectionNodes.length <= 1) {
		return connectionNodes;
	}

	const nodeScores = new Map<string, number>();

	connectionNodes.forEach((node) => {
		const incomingEdges = edges.filter((e) => e.target === node.id || e.source === node.id);
		const connectedCodeNodes = incomingEdges
			.map((e) => {
				const codeNodeId = e.source === node.id ? e.target : e.source;

				return codeNodes.find((c) => c.id === codeNodeId);
			})
			.filter(Boolean) as CodeNode[];

		const avgCodeX =
			connectedCodeNodes.length > 0
				? connectedCodeNodes.reduce((sum, c) => sum + (c?.position?.x || 0), 0) / connectedCodeNodes.length
				: 0;

		const usageCount = node.data.usedByFunctions.length;

		const score = avgCodeX * 1000 + usageCount * 100;
		nodeScores.set(node.id, score);
	});

	return [...connectionNodes].sort((a, b) => {
		const scoreA = nodeScores.get(a.id) || 0;
		const scoreB = nodeScores.get(b.id) || 0;

		return scoreA - scoreB;
	});
}

function optimizeEdgeCrossings(nodes: WorkflowNode[], edges: WorkflowEdge[], config: LayoutConfig): WorkflowNode[] {
	const triggerNodes = nodes.filter((n) => n.type === "trigger");
	const codeNodes = nodes.filter((n) => n.type === "code");
	const connectionNodes = nodes.filter((n) => n.type === "connection");

	const optimizedCodeNodes = minimizeCrossingsInLayer(codeNodes, edges, triggerNodes, "target", config);

	const optimizedConnectionNodes = minimizeCrossingsInLayer(
		connectionNodes,
		edges,
		optimizedCodeNodes,
		"target",
		config
	);

	return [...triggerNodes, ...optimizedCodeNodes, ...optimizedConnectionNodes];
}

function minimizeCrossingsInLayer(
	layerNodes: WorkflowNode[],
	edges: WorkflowEdge[],
	referenceNodes: WorkflowNode[],
	nodeRole: "source" | "target",
	config: LayoutConfig
): WorkflowNode[] {
	if (layerNodes.length <= 1) {
		return layerNodes;
	}

	const nodeBarycenter = new Map<string, number>();

	layerNodes.forEach((node) => {
		const connectedEdges = edges.filter((e) =>
			nodeRole === "target" ? e.target === node.id : e.source === node.id
		);

		const connectedRefNodes = connectedEdges
			.map((e) => {
				const refNodeId = nodeRole === "target" ? e.source : e.target;

				return referenceNodes.find((n) => n.id === refNodeId);
			})
			.filter(Boolean) as WorkflowNode[];

		if (connectedRefNodes.length > 0) {
			const avgX = connectedRefNodes.reduce((sum, n) => sum + (n.position?.x || 0), 0) / connectedRefNodes.length;
			nodeBarycenter.set(node.id, avgX);
		} else {
			nodeBarycenter.set(node.id, node.position?.x || 0);
		}
	});

	const sortedNodes = [...layerNodes].sort((a, b) => {
		const barycenterA = nodeBarycenter.get(a.id) || 0;
		const barycenterB = nodeBarycenter.get(b.id) || 0;

		return barycenterA - barycenterB;
	});

	const layerWidth = (sortedNodes.length - 1) * config.nodeSpacing.horizontal;
	const startX =
		config.alignment === "center"
			? config.startPosition.x + (calculateMaxLayerWidth(layerNodes, config) - layerWidth) / 2
			: config.startPosition.x;

	return sortedNodes.map((node, index) => ({
		...node,
		position: {
			x: startX + index * config.nodeSpacing.horizontal,
			y: node.position?.y || 0,
		},
	}));
}

function calculateMaxLayerWidth(nodes: WorkflowNode[], config: LayoutConfig): number {
	const triggerCount = nodes.filter((n) => n.type === "trigger").length;
	const codeCount = nodes.filter((n) => n.type === "code").length;
	const connectionCount = nodes.filter((n) => n.type === "connection").length;

	const maxCount = Math.max(triggerCount, codeCount, connectionCount);

	return (Math.min(maxCount, config.maxNodesPerRow) - 1) * config.nodeSpacing.horizontal;
}

export function getLayoutBounds(nodes: WorkflowNode[]): {
	height: number;
	maxX: number;
	maxY: number;
	minX: number;
	minY: number;
	width: number;
} {
	if (nodes.length === 0) {
		return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
	}

	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	nodes.forEach((node) => {
		const x = node.position?.x || 0;
		const y = node.position?.y || 0;

		minX = Math.min(minX, x);
		minY = Math.min(minY, y);
		maxX = Math.max(maxX, x + 200);
		maxY = Math.max(maxY, y + 100);
	});

	return {
		minX,
		minY,
		maxX,
		maxY,
		width: maxX - minX,
		height: maxY - minY,
	};
}

export function centerLayoutInViewport(
	nodes: WorkflowNode[],
	viewportWidth: number,
	viewportHeight: number,
	_padding: number = 50
): WorkflowNode[] {
	void _padding;
	const bounds = getLayoutBounds(nodes);

	if (bounds.width === 0 || bounds.height === 0) {
		return nodes;
	}

	const targetCenterX = viewportWidth / 2;
	const targetCenterY = viewportHeight / 2;

	const currentCenterX = bounds.minX + bounds.width / 2;
	const currentCenterY = bounds.minY + bounds.height / 2;

	const offsetX = targetCenterX - currentCenterX;
	const offsetY = targetCenterY - currentCenterY;

	return nodes.map((node) => ({
		...node,
		position: {
			x: (node.position?.x || 0) + offsetX,
			y: (node.position?.y || 0) + offsetY,
		},
	}));
}

export function fitLayoutToViewport(
	nodes: WorkflowNode[],
	viewportWidth: number,
	viewportHeight: number,
	padding: number = 50
): { nodes: WorkflowNode[]; scale: number } {
	const bounds = getLayoutBounds(nodes);

	if (bounds.width === 0 || bounds.height === 0) {
		return { nodes, scale: 1 };
	}

	const availableWidth = viewportWidth - padding * 2;
	const availableHeight = viewportHeight - padding * 2;

	const scaleX = availableWidth / bounds.width;
	const scaleY = availableHeight / bounds.height;
	const scale = Math.min(scaleX, scaleY, 1);

	const centeredNodes = centerLayoutInViewport(nodes, viewportWidth, viewportHeight, padding);

	return { nodes: centeredNodes, scale };
}

export function createCompactLayout(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
	const compactConfig: LayoutConfig = {
		...DEFAULT_LAYOUT_CONFIG,
		nodeSpacing: { horizontal: 180, vertical: 100 },
		layerGap: 140,
	};

	return applyAutoLayout(nodes, edges, compactConfig);
}

export function createSpreadLayout(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
	const spreadConfig: LayoutConfig = {
		...DEFAULT_LAYOUT_CONFIG,
		nodeSpacing: { horizontal: 300, vertical: 160 },
		layerGap: 240,
	};

	return applyAutoLayout(nodes, edges, spreadConfig);
}
