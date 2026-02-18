import { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import {
	CodeNode,
	ConnectionNode,
	GraphBuildWarning,
	LegacyWorkflowEdgeData,
	ProjectVariable,
	TriggerNode,
	WorkflowBuilderState,
	WorkflowEdge,
	WorkflowEdgeVariable,
	WorkflowNode,
} from "@interfaces/components/workflowBuilder.interface";
import { WorkflowBuilderService } from "@services/workflowBuilder.service";
import { applyAutoLayout, buildWorkflowGraph } from "@utilities/index";

interface OriginalProjectState {
	nodes: WorkflowNode[];
	edges: WorkflowEdge[];
	variables: ProjectVariable[];
}

let originalProjectState: OriginalProjectState | null = null;

const store: StateCreator<WorkflowBuilderState> = (set, get) => ({
	nodes: [],
	edges: [],
	variables: [],
	selectedNodeId: null,
	selectedEdgeId: null,
	triggerNodeId: null,

	projectId: null,
	buildId: null,
	isLoadingProject: false,
	loadError: null,
	hasUnsavedChanges: false,
	warnings: [] as GraphBuildWarning[],

	addNode: (node: WorkflowNode) =>
		set((state) => ({
			nodes: [...state.nodes, node],
		})),

	removeNode: (nodeId: string) =>
		set((state) => ({
			nodes: state.nodes.filter((node) => node.id !== nodeId),
			edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
			selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
		})),

	updateNode: (nodeId: string, data: Partial<WorkflowNode["data"]>) =>
		set((state) => ({
			nodes: state.nodes.map((node) =>
				node.id === nodeId ? ({ ...node, data: { ...node.data, ...data } } as WorkflowNode) : node
			),
		})),

	updateNodePosition: (nodeId: string, position: { x: number; y: number }) =>
		set((state) => ({
			nodes: state.nodes.map((node) => (node.id === nodeId ? { ...node, position } : node)),
		})),

	setNodes: (nodes: WorkflowNode[]) => set({ nodes }),

	setSelectedNodeId: (nodeId: string | null) => set({ selectedNodeId: nodeId }),

	setTriggerNodeId: (nodeId: string | null) => set({ triggerNodeId: nodeId }),

	addEdge: (edge: WorkflowEdge) =>
		set((state) => ({
			edges: [...state.edges, edge],
		})),

	removeEdge: (edgeId: string) =>
		set((state) => ({
			edges: state.edges.filter((edge) => edge.id !== edgeId),
			selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
		})),

	updateEdge: (edgeId: string, data: Partial<WorkflowEdge["data"]>) =>
		set((state) => ({
			edges: state.edges.map((edge) =>
				edge.id === edgeId ? ({ ...edge, data: { ...edge.data, ...data } } as WorkflowEdge) : edge
			),
		})),

	updateEdgeCode: (edgeId: string, code: string) =>
		set((state) => ({
			edges: state.edges.map((edge) =>
				edge.id === edgeId ? { ...edge, data: { ...(edge.data as LegacyWorkflowEdgeData), code } } : edge
			),
		})),

	updateEdgeEventType: (edgeId: string, eventType: string) =>
		set((state) => ({
			edges: state.edges.map((edge) =>
				edge.id === edgeId ? { ...edge, data: { ...(edge.data as LegacyWorkflowEdgeData), eventType } } : edge
			),
		})),

	updateEdgeVariables: (edgeId: string, variables: WorkflowEdgeVariable[]) =>
		set((state) => ({
			edges: state.edges.map((edge) =>
				edge.id === edgeId ? { ...edge, data: { ...(edge.data as LegacyWorkflowEdgeData), variables } } : edge
			),
		})),

	setEdges: (edges: WorkflowEdge[]) => set({ edges }),

	setSelectedEdgeId: (edgeId: string | null) => set({ selectedEdgeId: edgeId }),

	addVariable: (variable: ProjectVariable) =>
		set((state) => ({
			variables: [...state.variables, variable],
		})),

	updateVariable: (id: string, updates: Partial<ProjectVariable>) =>
		set((state) => ({
			variables: state.variables.map((v) => (v.id === id ? { ...v, ...updates } : v)),
		})),

	removeVariable: (id: string) =>
		set((state) => ({
			variables: state.variables.filter((v) => v.id !== id),
		})),

	setVariables: (variables: ProjectVariable[]) => set({ variables }),

	clearWorkflow: () => {
		originalProjectState = null;
		set({
			nodes: [],
			edges: [],
			variables: [],
			selectedNodeId: null,
			selectedEdgeId: null,
			triggerNodeId: null,
			projectId: null,
			buildId: null,
			isLoadingProject: false,
			loadError: null,
			hasUnsavedChanges: false,
			warnings: [],
		});
	},

	getTriggerNodes: () => get().nodes.filter((node): node is TriggerNode => node.type === "trigger"),

	getCodeNodes: () => get().nodes.filter((node): node is CodeNode => node.type === "code"),

	getConnectionNodes: () => get().nodes.filter((node): node is ConnectionNode => node.type === "connection"),

	loadProjectWorkflow: async (projectId: string, buildId?: string) => {
		set({
			isLoadingProject: true,
			loadError: null,
			projectId,
			buildId: buildId || null,
		});

		const result = await WorkflowBuilderService.loadProjectWorkflowData(projectId, buildId);

		if (!result.data) {
			set({
				isLoadingProject: false,
				loadError: typeof result.error === "string" ? result.error : "Failed to load project workflow data",
			});

			return;
		}

		const graphResult = buildWorkflowGraph(result.data);
		const layoutedNodes = applyAutoLayout(graphResult.nodes, graphResult.edges);

		originalProjectState = {
			nodes: layoutedNodes,
			edges: graphResult.edges,
			variables: graphResult.variables,
		};

		set({
			nodes: layoutedNodes,
			edges: graphResult.edges,
			variables: graphResult.variables,
			warnings: graphResult.warnings,
			isLoadingProject: false,
			loadError: null,
			hasUnsavedChanges: false,
			selectedNodeId: null,
			selectedEdgeId: null,
		});

		const triggerNodes = layoutedNodes.filter((n) => n.type === "trigger");
		if (triggerNodes.length > 0) {
			set({ triggerNodeId: triggerNodes[0].id });
		}
	},

	resetToProjectState: () => {
		if (originalProjectState) {
			set({
				nodes: originalProjectState.nodes,
				edges: originalProjectState.edges,
				variables: originalProjectState.variables,
				hasUnsavedChanges: false,
				selectedNodeId: null,
				selectedEdgeId: null,
			});
		}
	},

	setHasUnsavedChanges: (hasChanges: boolean) => set({ hasUnsavedChanges: hasChanges }),

	clearLoadError: () => set({ loadError: null }),
});

export const useWorkflowBuilderStore = create(
	persist(store, {
		name: "workflow-builder-storage",
		partialize: (state) => ({
			nodes: state.nodes,
			edges: state.edges,
			variables: state.variables,
			projectId: state.projectId,
			buildId: state.buildId,
			warnings: state.warnings,
		}),
	}),
	shallow
);
