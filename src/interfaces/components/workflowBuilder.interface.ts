import { Node, Edge } from "@xyflow/react";

import { Integrations } from "@src/enums/components";

export interface IntegrationNodeData extends Record<string, unknown> {
	integration: Integrations;
	label: string;
	isTrigger?: boolean;
}

export type WorkflowNode = Node<IntegrationNodeData, "integration">;

export interface WorkflowEdgeVariable {
	key: string;
	value: string;
	isSecret?: boolean;
}

export type EdgeStatus = "draft" | "configured" | "active" | "error";

export interface WorkflowEdgeData extends Record<string, unknown> {
	code: string;
	eventType: string;
	variables: WorkflowEdgeVariable[];
	status: EdgeStatus;
}

export type WorkflowEdge = Edge<WorkflowEdgeData>;

export interface WorkflowBuilderState {
	nodes: WorkflowNode[];
	edges: WorkflowEdge[];
	selectedEdgeId: string | null;
	triggerNodeId: string | null;
	addNode: (node: WorkflowNode) => void;
	removeNode: (nodeId: string) => void;
	updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
	setNodes: (nodes: WorkflowNode[]) => void;
	addEdge: (edge: WorkflowEdge) => void;
	removeEdge: (edgeId: string) => void;
	updateEdgeCode: (edgeId: string, code: string) => void;
	updateEdgeEventType: (edgeId: string, eventType: string) => void;
	updateEdgeVariables: (edgeId: string, variables: WorkflowEdgeVariable[]) => void;
	updateEdgeStatus: (edgeId: string, status: EdgeStatus) => void;
	setEdges: (edges: WorkflowEdge[]) => void;
	setSelectedEdgeId: (edgeId: string | null) => void;
	setTriggerNodeId: (nodeId: string | null) => void;
	clearWorkflow: () => void;
}
