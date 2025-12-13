// Node Components Index
// This barrel file exports all the custom node types for the workflow canvas.
// These are registered with React Flow to render different node types.

// Node types map for React Flow registration
// This object maps node type strings to their React components
import { ConnectionNode } from "./connectionNode";
import { FileNode } from "./fileNode";
import { TriggerNode } from "./triggerNode";
import { VariableNode } from "./variableNode";

export { BaseNodeWrapper, NodeHeader, StatusIndicator, NodeDivider, NodeContent, FunctionItem } from "./baseNode";
export { ConnectionNode } from "./connectionNode";
export { FileNode } from "./fileNode";
export { TriggerNode } from "./triggerNode";
export { VariableNode } from "./variableNode";

export const nodeTypes = {
	connection: ConnectionNode,
	file: FileNode,
	trigger: TriggerNode,
	variable: VariableNode,
};
