import { Node, Edge, Viewport, XYPosition } from "@xyflow/react";

import { Connection, Trigger, Variable } from "@src/types/models";

// Node data types for different node categories
// Index signatures are required for React Flow compatibility with Record<string, unknown>
export interface ConnectionNodeData extends Record<string, unknown> {
	connectionId: string;
	name: string;
	integrationId: string;
	integrationUniqueName: string;
	status: "ok" | "warning" | "error" | "init_required";
	statusMessage?: string;
	logo?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface FileNodeData extends Record<string, unknown> {
	fileName: string;
	filePath: string;
	language: "python" | "javascript" | "typescript" | "starlark" | "yaml" | "unknown";
	functions: string[];
	content?: string;
	isEntrypoint?: boolean;
}

export interface TriggerNodeData extends Record<string, unknown> {
	triggerId: string;
	name: string;
	triggerType: "connection" | "schedule" | "webhook";
	connectionId?: string;
	entrypoint?: string;
	filePath?: string;
	functionName?: string;
	schedule?: string;
	webhookSlug?: string;
	eventType?: string;
	filter?: string;
}

export interface VariableNodeData extends Record<string, unknown> {
	variableId: string;
	name: string;
	value?: string;
	isSecret: boolean;
}

// Union type for all node data
export type WorkflowNodeData = ConnectionNodeData | FileNodeData | TriggerNodeData | VariableNodeData;

// Custom node types
export type WorkflowNodeType = "connection" | "file" | "trigger" | "variable";

// Extended node type with our custom data
export interface WorkflowNode extends Node<WorkflowNodeData, WorkflowNodeType> {
	type: WorkflowNodeType;
	data: WorkflowNodeData;
}

// Edge types for different relationships
export type WorkflowEdgeType = "trigger" | "dependency" | "default";

export interface WorkflowEdge extends Edge {
	type?: WorkflowEdgeType;
	data?: {
		label?: string;
		triggerType?: string;
	};
}

// Canvas state interface
export interface CanvasState {
	nodes: WorkflowNode[];
	edges: WorkflowEdge[];
	viewport: Viewport;
}

// Drag item from sidebar
export interface DragItem {
	type: WorkflowNodeType;
	data: Partial<WorkflowNodeData>;
	label: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Sidebar section
export interface SidebarSection {
	title: string;
	items: DragItem[];
	isCollapsed?: boolean;
}

// Original data tracking for sync comparison
export interface OriginalProjectData {
	connections: Connection[];
	triggers: Trigger[];
	resources: Record<string, Uint8Array>;
	variables: Variable[];
}

// Sync result interface
export interface SyncResult {
	success: boolean;
	triggersUpdated: number;
	triggersCreated: number;
	triggersDeleted: number;
	errors: string[];
}

// Store interface
export interface WorkflowCanvasStore {
	// Canvas state
	nodes: WorkflowNode[];
	edges: WorkflowEdge[];
	viewport: Viewport;
	selectedNodes: string[];
	selectedEdges: string[];

	// Project tracking
	currentProjectId: string | null;
	originalData: OriginalProjectData | null;

	// UI state
	isSidebarOpen: boolean;
	isLoading: boolean;
	isDirty: boolean;
	isSyncing: boolean;

	// History for undo/redo
	history: CanvasState[];
	historyIndex: number;

	// Node operations
	setNodes: (nodes: WorkflowNode[]) => void;
	addNode: (node: WorkflowNode) => void;
	updateNode: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
	removeNode: (nodeId: string) => void;

	// Edge operations
	setEdges: (edges: WorkflowEdge[]) => void;
	addEdge: (edge: WorkflowEdge) => void;
	removeEdge: (edgeId: string) => void;

	// Selection
	setSelectedNodes: (nodeIds: string[]) => void;
	setSelectedEdges: (edgeIds: string[]) => void;
	clearSelection: () => void;

	// Viewport
	setViewport: (viewport: Viewport) => void;
	fitView: () => void;

	// UI state
	toggleSidebar: () => void;
	setLoading: (loading: boolean) => void;
	setDirty: (dirty: boolean) => void;

	// History
	undo: () => void;
	redo: () => void;
	saveToHistory: () => void;

	// Initialization and sync
	initFromProject: (
		projectId: string,
		connections: Connection[],
		triggers: Trigger[],
		resources: Record<string, Uint8Array>,
		variables: Variable[]
	) => void;
	syncToBackend: () => Promise<SyncResult>;
	reset: () => void;

	// Sync state
	setSyncing: (syncing: boolean) => void;
}

// Props for canvas components
export interface WorkflowCanvasProps {
	projectId: string;
	className?: string;
	readOnly?: boolean;
}

export interface WorkflowSidebarProps {
	sections: SidebarSection[];
	onDragStart: (item: DragItem) => void;
	isOpen: boolean;
	onToggle: () => void;
}

export interface BaseNodeProps {
	id: string;
	data: WorkflowNodeData;
	selected?: boolean;
	isConnectable?: boolean;
}

export interface ConnectionNodeProps extends BaseNodeProps {
	data: ConnectionNodeData;
}

export interface FileNodeProps extends BaseNodeProps {
	data: FileNodeData;
}

export interface TriggerNodeProps extends BaseNodeProps {
	data: TriggerNodeData;
}

// Layout configuration
export interface LayoutConfig {
	direction: "TB" | "LR" | "BT" | "RL";
	nodeSpacing: number;
	rankSpacing: number;
	marginX: number;
	marginY: number;
}

// Position calculation result
export interface NodeLayout {
	id: string;
	position: XYPosition;
	width: number;
	height: number;
}
