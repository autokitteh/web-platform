import { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { WorkflowBuilderState, WorkflowEdge, WorkflowNode } from "@interfaces/components/workflowBuilder.interface";

const store: StateCreator<WorkflowBuilderState> = (set) => ({
	nodes: [],
	edges: [],
	selectedEdgeId: null,

	addNode: (node: WorkflowNode) =>
		set((state) => ({
			nodes: [...state.nodes, node],
		})),

	removeNode: (nodeId: string) =>
		set((state) => ({
			nodes: state.nodes.filter((node) => node.id !== nodeId),
			edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
		})),

	updateNodePosition: (nodeId: string, position: { x: number; y: number }) =>
		set((state) => ({
			nodes: state.nodes.map((node) => (node.id === nodeId ? { ...node, position } : node)),
		})),

	setNodes: (nodes: WorkflowNode[]) => set({ nodes }),

	addEdge: (edge: WorkflowEdge) =>
		set((state) => ({
			edges: [...state.edges, edge],
		})),

	removeEdge: (edgeId: string) =>
		set((state) => ({
			edges: state.edges.filter((edge) => edge.id !== edgeId),
			selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
		})),

	updateEdgeCode: (edgeId: string, code: string) =>
		set((state) => ({
			edges: state.edges.map((edge) =>
				edge.id === edgeId ? { ...edge, data: { code, eventType: edge.data?.eventType || "" } } : edge
			),
		})),

	updateEdgeEventType: (edgeId: string, eventType: string) =>
		set((state) => ({
			edges: state.edges.map((edge) =>
				edge.id === edgeId ? { ...edge, data: { code: edge.data?.code || "", eventType } } : edge
			),
		})),

	setEdges: (edges: WorkflowEdge[]) => set({ edges }),

	setSelectedEdgeId: (edgeId: string | null) => set({ selectedEdgeId: edgeId }),

	clearWorkflow: () => set({ nodes: [], edges: [], selectedEdgeId: null }),
});

export const useWorkflowBuilderStore = create(
	persist(store, {
		name: "workflow-builder-storage",
		partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
	}),
	shallow
);
