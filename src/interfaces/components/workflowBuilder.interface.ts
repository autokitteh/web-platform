import { Node, Edge } from "@xyflow/react";

import { Integrations } from "@src/enums/components";

export interface IntegrationNodeData extends Record<string, unknown> {
	integration: Integrations;
	label: string;
}

export type WorkflowNode = Node<IntegrationNodeData, "integration">;

export interface WorkflowEdgeData extends Record<string, unknown> {
	code: string;
	eventType: string;
}

export type WorkflowEdge = Edge<WorkflowEdgeData>;

export interface WorkflowBuilderState {
	nodes: WorkflowNode[];
	edges: WorkflowEdge[];
	selectedEdgeId: string | null;
	addNode: (node: WorkflowNode) => void;
	removeNode: (nodeId: string) => void;
	updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
	setNodes: (nodes: WorkflowNode[]) => void;
	addEdge: (edge: WorkflowEdge) => void;
	removeEdge: (edgeId: string) => void;
	updateEdgeCode: (edgeId: string, code: string) => void;
	updateEdgeEventType: (edgeId: string, eventType: string) => void;
	setEdges: (edges: WorkflowEdge[]) => void;
	setSelectedEdgeId: (edgeId: string | null) => void;
	clearWorkflow: () => void;
}
