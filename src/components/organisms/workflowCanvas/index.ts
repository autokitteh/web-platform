// Workflow Canvas - Main Exports
// This is the primary entry point for the visual workflow builder feature.
// Import from this file when using the workflow canvas in other parts of the app.

// Main components
export { WorkflowCanvas } from "./workflowCanvas";
export { WorkflowCanvasPage } from "./workflowCanvasPage";

// Node components - for custom rendering or extension
export { nodeTypes } from "./nodes";
export {
	ConnectionNode,
	FileNode,
	TriggerNode,
	VariableNode,
	BaseNodeWrapper,
	NodeHeader,
	NodeContent,
	NodeDivider,
	StatusIndicator,
	FunctionItem,
} from "./nodes";

// Edge components
export { edgeTypes } from "./edges";
export { TriggerEdge } from "./edges";

// Sidebar components
export { WorkflowSidebar, createDefaultSections } from "./sidebar";

// Re-export types for consumers
export type {
	WorkflowCanvasProps,
	WorkflowNode,
	WorkflowEdge,
	WorkflowNodeType,
	WorkflowEdgeType,
	WorkflowNodeData,
	ConnectionNodeData,
	FileNodeData,
	TriggerNodeData,
	VariableNodeData,
	DragItem,
	SidebarSection,
} from "@interfaces/store/workflowCanvasStore.interface";
