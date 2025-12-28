import { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import {
	EdgeStatus,
	WorkflowBuilderState,
	WorkflowEdge,
	WorkflowEdgeVariable,
	WorkflowNode,
} from "@interfaces/components/workflowBuilder.interface";

const computeEdgeStatus = (code: string, eventType: string): EdgeStatus => {
	const hasCode = code && code.trim().length > 0;
	const hasEventType = eventType && eventType.trim().length > 0;
	if (hasCode && hasEventType) return "configured";
	return "draft";
};

const store: StateCreator<WorkflowBuilderState> = (set) => ({
	nodes: [],
	edges: [],
	selectedEdgeId: null,
	triggerNodeId: null,

	addNode: (node: WorkflowNode) =>
		set((state) => ({
			nodes: [...state.nodes, node],
		})),

	removeNode: (nodeId: string) =>
		set((state) => {
			const newTriggerNodeId = state.triggerNodeId === nodeId ? null : state.triggerNodeId;
			return {
				nodes: state.nodes.filter((node) => node.id !== nodeId),
				edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
				triggerNodeId: newTriggerNodeId,
			};
		}),

	updateNodePosition: (nodeId: string, position: { x: number; y: number }) =>
		set((state) => ({
			nodes: state.nodes.map((node) => (node.id === nodeId ? { ...node, position } : node)),
		})),

	setNodes: (nodes: WorkflowNode[]) => set({ nodes }),

	addEdge: (edge: WorkflowEdge) =>
		set((state) => {
			const isFirstEdgeFromSource = !state.edges.some((e) => e.source === edge.source);
			const shouldSetTrigger = isFirstEdgeFromSource && !state.triggerNodeId;
			return {
				edges: [...state.edges, edge],
				triggerNodeId: shouldSetTrigger ? edge.source : state.triggerNodeId,
			};
		}),

	removeEdge: (edgeId: string) =>
		set((state) => {
			const edgeToRemove = state.edges.find((e) => e.id === edgeId);
			const remainingEdges = state.edges.filter((edge) => edge.id !== edgeId);
			const sourceStillHasEdges = remainingEdges.some((e) => e.source === edgeToRemove?.source);
			const newTriggerNodeId =
				state.triggerNodeId === edgeToRemove?.source && !sourceStillHasEdges ? null : state.triggerNodeId;
			return {
				edges: remainingEdges,
				selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
				triggerNodeId: newTriggerNodeId,
			};
		}),

	updateEdgeCode: (edgeId: string, code: string) =>
		set((state) => ({
			edges: state.edges.map((edge) => {
				if (edge.id !== edgeId) return edge;
				const eventType = edge.data?.eventType || "";
				const variables = edge.data?.variables || [];
				return {
					...edge,
					data: {
						code,
						eventType,
						variables,
						status: computeEdgeStatus(code, eventType),
					},
				};
			}),
		})),

	updateEdgeEventType: (edgeId: string, eventType: string) =>
		set((state) => ({
			edges: state.edges.map((edge) => {
				if (edge.id !== edgeId) return edge;
				const code = edge.data?.code || "";
				const variables = edge.data?.variables || [];
				return {
					...edge,
					data: {
						code,
						eventType,
						variables,
						status: computeEdgeStatus(code, eventType),
					},
				};
			}),
		})),

	updateEdgeVariables: (edgeId: string, variables: WorkflowEdgeVariable[]) =>
		set((state) => ({
			edges: state.edges.map((edge) => {
				if (edge.id !== edgeId) return edge;
				return {
					...edge,
					data: {
						...edge.data,
						code: edge.data?.code || "",
						eventType: edge.data?.eventType || "",
						status: edge.data?.status || "draft",
						variables,
					},
				};
			}),
		})),

	updateEdgeStatus: (edgeId: string, status: EdgeStatus) =>
		set((state) => ({
			edges: state.edges.map((edge) =>
				edge.id === edgeId
					? {
							...edge,
							data: {
								...edge.data,
								code: edge.data?.code || "",
								eventType: edge.data?.eventType || "",
								variables: edge.data?.variables || [],
								status,
							},
						}
					: edge
			),
		})),

	setEdges: (edges: WorkflowEdge[]) => set({ edges }),

	setSelectedEdgeId: (edgeId: string | null) => set({ selectedEdgeId: edgeId }),

	setTriggerNodeId: (nodeId: string | null) =>
		set((state) => ({
			triggerNodeId: nodeId,
			nodes: state.nodes.map((node) => ({
				...node,
				data: { ...node.data, isTrigger: node.id === nodeId },
			})),
		})),

	clearWorkflow: () => set({ nodes: [], edges: [], selectedEdgeId: null, triggerNodeId: null }),
});

export const useWorkflowBuilderStore = create(
	persist(store, {
		name: "workflow-builder-storage",
		partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
	}),
	shallow
);
