import { Node, Edge } from "@xyflow/react";

import { Integrations } from "@src/enums/components";

export type TriggerType = "schedule" | "webhook" | "event";
export type NodeStatus = "draft" | "configured" | "active" | "error";
export type ConnectionStatus = "disconnected" | "connected" | "active" | "error";

export interface ProjectVariable {
	id: string;
	name: string;
	value: string;
	isSecret: boolean;
}

export interface EntryPoint {
	name: string;
	lineNumber: number;
	isActive: boolean;
}

export interface TriggerNodeData extends Record<string, unknown> {
	type: TriggerType;
	name: string;
	schedule?: string;
	webhookPath?: string;
	httpMethod?: "GET" | "POST" | "PUT" | "DELETE";
	connectionRef?: string;
	eventType?: string;
	eventFilter?: string;
	call: string;
	isDurable: boolean;
	status: NodeStatus;
}

export interface CodeNodeData extends Record<string, unknown> {
	fileName: string;
	filePath: string;
	language: "python" | "starlark";
	entryPoints: EntryPoint[];
	usedConnections: string[];
	status: NodeStatus;
}

export interface ConnectionNodeData extends Record<string, unknown> {
	connectionName: string;
	integration: Integrations;
	displayName: string;
	status: ConnectionStatus;
	usedByFunctions: string[];
}

export interface IntegrationNodeData extends Record<string, unknown> {
	integration: Integrations;
	label: string;
	isTrigger?: boolean;
}

export type TriggerNode = Node<TriggerNodeData, "trigger">;
export type CodeNode = Node<CodeNodeData, "code">;
export type ConnectionNode = Node<ConnectionNodeData, "connection">;
export type IntegrationNode = Node<IntegrationNodeData, "integration">;

export type WorkflowNode = TriggerNode | CodeNode | ConnectionNode | IntegrationNode;

export interface ExecutionEdgeData extends Record<string, unknown> {
	type: "execution";
	functionCall: string;
	isActive: boolean;
}

export interface DataEdgeData extends Record<string, unknown> {
	type: "data";
	operations: {
		functionName: string;
		lineNumber?: number;
		operationType: "read" | "write";
	}[];
}

export interface EventEdgeData extends Record<string, unknown> {
	type: "event";
	eventType: string;
	filter?: string;
}

export interface WorkflowEdgeVariable {
	key: string;
	value: string;
	isSecret?: boolean;
}

export type EdgeStatus = "draft" | "configured" | "active" | "error";

export interface LegacyWorkflowEdgeData extends Record<string, unknown> {
	code: string;
	eventType: string;
	variables: WorkflowEdgeVariable[];
	status: EdgeStatus;
}

export type ExecutionEdge = Edge<ExecutionEdgeData>;
export type DataEdge = Edge<DataEdgeData>;
export type EventEdge = Edge<EventEdgeData>;
export type LegacyWorkflowEdge = Edge<LegacyWorkflowEdgeData>;

export type WorkflowEdge = ExecutionEdge | DataEdge | EventEdge | LegacyWorkflowEdge;

export interface GraphBuildWarning {
	type: string;
	message: string;
	affectedIds: string[];
}

export interface WorkflowBuilderState {
	nodes: WorkflowNode[];
	edges: WorkflowEdge[];
	variables: ProjectVariable[];
	selectedNodeId: string | null;
	selectedEdgeId: string | null;
	triggerNodeId: string | null;

	projectId: string | null;
	buildId: string | null;
	isLoadingProject: boolean;
	loadError: string | null;
	hasUnsavedChanges: boolean;
	warnings: GraphBuildWarning[];

	addNode: (node: WorkflowNode) => void;
	removeNode: (nodeId: string) => void;
	updateNode: (nodeId: string, data: Partial<WorkflowNode["data"]>) => void;
	updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
	setNodes: (nodes: WorkflowNode[]) => void;
	setSelectedNodeId: (nodeId: string | null) => void;
	setTriggerNodeId: (nodeId: string | null) => void;

	addEdge: (edge: WorkflowEdge) => void;
	removeEdge: (edgeId: string) => void;
	updateEdge: (edgeId: string, data: Partial<WorkflowEdge["data"]>) => void;
	updateEdgeCode: (edgeId: string, code: string) => void;
	updateEdgeEventType: (edgeId: string, eventType: string) => void;
	updateEdgeVariables: (edgeId: string, variables: WorkflowEdgeVariable[]) => void;
	setEdges: (edges: WorkflowEdge[]) => void;
	setSelectedEdgeId: (edgeId: string | null) => void;

	addVariable: (variable: ProjectVariable) => void;
	updateVariable: (id: string, updates: Partial<ProjectVariable>) => void;
	removeVariable: (id: string) => void;
	setVariables: (variables: ProjectVariable[]) => void;

	clearWorkflow: () => void;

	getTriggerNodes: () => TriggerNode[];
	getCodeNodes: () => CodeNode[];
	getConnectionNodes: () => ConnectionNode[];

	loadProjectWorkflow: (projectId: string, buildId?: string) => Promise<void>;
	resetToProjectState: () => void;
	setHasUnsavedChanges: (hasChanges: boolean) => void;
	clearLoadError: () => void;
}
