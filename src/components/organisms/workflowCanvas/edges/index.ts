// Edge Components Index
// This barrel file exports all custom edge types for the workflow canvas.
// These are registered with React Flow to render different connection styles.

// Edge types map for React Flow registration
// This object maps edge type strings to their React components
import { TriggerEdge } from "./triggerEdge";

export { TriggerEdge } from "./triggerEdge";

export const edgeTypes = {
	trigger: TriggerEdge,
	// Default edge type will use React Flow's built-in edge
	// We can add more custom edge types here as needed:
	// dependency: DependencyEdge,
	// dataFlow: DataFlowEdge,
};
