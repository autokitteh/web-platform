import { Viewport } from "@xyflow/react";
import { t } from "i18next";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { calculateAutoLayout, parseFileLanguage, extractFunctionsFromContent } from "./utils/workflowCanvasUtils";
import {
	WorkflowCanvasStore,
	WorkflowNode,
	WorkflowEdge,
	CanvasState,
	ConnectionNodeData,
	FileNodeData,
	TriggerNodeData,
	VariableNodeData,
	OriginalProjectData,
	SyncResult,
} from "@interfaces/store/workflowCanvasStore.interface";
import { TriggersService } from "@services";
import { Trigger } from "@type/models";

import { useToastStore } from "@store";

// Initial viewport centered on the canvas
const initialViewport: Viewport = {
	x: 0,
	y: 0,
	zoom: 1,
};

// Maximum history entries for undo/redo
const maxHistorySize = 50;

export const useWorkflowCanvasStore = create<WorkflowCanvasStore>()(
	immer((set, get) => ({
		// Initial state
		nodes: [],
		edges: [],
		viewport: initialViewport,
		selectedNodes: [],
		selectedEdges: [],
		currentProjectId: null,
		originalData: null,
		isSidebarOpen: true,
		isLoading: false,
		isDirty: false,
		isSyncing: false,
		history: [],
		historyIndex: -1,

		// Node operations
		setNodes: (nodes) =>
			set((state) => {
				state.nodes = nodes;
				state.isDirty = true;
			}),

		addNode: (node) =>
			set((state) => {
				// Check for duplicate IDs
				const existingIndex = state.nodes.findIndex((n) => n.id === node.id);
				if (existingIndex === -1) {
					state.nodes.push(node);
				} else {
					state.nodes[existingIndex] = node;
				}
				state.isDirty = true;
			}),

		updateNode: (nodeId, data) =>
			set((state) => {
				const nodeIndex = state.nodes.findIndex((n) => n.id === nodeId);
				if (nodeIndex !== -1) {
					state.nodes[nodeIndex].data = {
						...state.nodes[nodeIndex].data,
						...data,
					};
					state.isDirty = true;
				}
			}),

		removeNode: (nodeId) =>
			set((state) => {
				state.nodes = state.nodes.filter((n) => n.id !== nodeId);
				// Also remove any connected edges
				state.edges = state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
				state.isDirty = true;
			}),

		// Edge operations
		setEdges: (edges) =>
			set((state) => {
				state.edges = edges;
				state.isDirty = true;
			}),

		addEdge: (edge) =>
			set((state) => {
				// Check for duplicate edges between same source and target
				const existingEdge = state.edges.find((e) => e.source === edge.source && e.target === edge.target);
				if (!existingEdge) {
					state.edges.push(edge);
					state.isDirty = true;
				}
			}),

		removeEdge: (edgeId) =>
			set((state) => {
				state.edges = state.edges.filter((e) => e.id !== edgeId);
				state.isDirty = true;
			}),

		// Selection operations
		setSelectedNodes: (nodeIds) =>
			set((state) => {
				state.selectedNodes = nodeIds;
			}),

		setSelectedEdges: (edgeIds) =>
			set((state) => {
				state.selectedEdges = edgeIds;
			}),

		clearSelection: () =>
			set((state) => {
				state.selectedNodes = [];
				state.selectedEdges = [];
			}),

		// Viewport operations
		setViewport: (viewport) =>
			set((state) => {
				state.viewport = viewport;
			}),

		fitView: () => {
			// This will be called externally using React Flow's fitView
			// The store just marks that a fit view was requested
		},

		// UI state operations
		toggleSidebar: () =>
			set((state) => {
				state.isSidebarOpen = !state.isSidebarOpen;
			}),

		setLoading: (loading) =>
			set((state) => {
				state.isLoading = loading;
			}),

		setDirty: (dirty) =>
			set((state) => {
				state.isDirty = dirty;
			}),

		setSyncing: (syncing) =>
			set((state) => {
				state.isSyncing = syncing;
			}),

		// History operations for undo/redo
		saveToHistory: () =>
			set((state) => {
				const currentState: CanvasState = {
					nodes: JSON.parse(JSON.stringify(state.nodes)),
					edges: JSON.parse(JSON.stringify(state.edges)),
					viewport: { ...state.viewport },
				};

				// Remove any future history if we're not at the end
				if (state.historyIndex < state.history.length - 1) {
					state.history = state.history.slice(0, state.historyIndex + 1);
				}

				// Add new state
				state.history.push(currentState);

				// Limit history size
				if (state.history.length > maxHistorySize) {
					state.history = state.history.slice(-maxHistorySize);
				}

				state.historyIndex = state.history.length - 1;
			}),

		undo: () =>
			set((state) => {
				if (state.historyIndex > 0) {
					state.historyIndex -= 1;
					const previousState = state.history[state.historyIndex];
					state.nodes = previousState.nodes;
					state.edges = previousState.edges;
					state.viewport = previousState.viewport;
					state.isDirty = true;
				}
			}),

		redo: () =>
			set((state) => {
				if (state.historyIndex < state.history.length - 1) {
					state.historyIndex += 1;
					const nextState = state.history[state.historyIndex];
					state.nodes = nextState.nodes;
					state.edges = nextState.edges;
					state.viewport = nextState.viewport;
					state.isDirty = true;
				}
			}),

		// Initialize canvas from project data
		initFromProject: (projectId, connections, triggers, resources, variables) =>
			set((state) => {
				state.isLoading = true;
				state.currentProjectId = projectId;

				// Store original data for sync comparison
				const originalData: OriginalProjectData = {
					connections: JSON.parse(JSON.stringify(connections)),
					triggers: JSON.parse(JSON.stringify(triggers)),
					resources: { ...resources },
					variables: JSON.parse(JSON.stringify(variables)),
				};
				state.originalData = originalData;

				const nodes: WorkflowNode[] = [];
				const edges: WorkflowEdge[] = [];

				// Create connection nodes
				connections.forEach((conn, index) => {
					const connectionNode: WorkflowNode = {
						id: `connection-${conn.connectionId}`,
						type: "connection",
						position: { x: 100, y: 100 + index * 150 },
						data: {
							connectionId: conn.connectionId,
							name: conn.name || conn.integrationId || "Unknown",
							integrationId: conn.integrationId || "",
							integrationUniqueName: conn.integrationUniqueName || "",
							status: conn.status,
							statusMessage: conn.statusInfoMessage,
							logo: conn.logo,
						} as ConnectionNodeData,
					};
					nodes.push(connectionNode);
				});

				// Create file nodes from resources
				const fileNames = Object.keys(resources || {});
				fileNames.forEach((fileName, index) => {
					const content = resources[fileName];
					const textDecoder = new TextDecoder();
					const fileContent = content ? textDecoder.decode(content) : "";
					const language = parseFileLanguage(fileName);
					const functions = extractFunctionsFromContent(fileContent, language);

					const fileNode: WorkflowNode = {
						id: `file-${fileName}`,
						type: "file",
						position: { x: 500, y: 100 + index * 180 },
						data: {
							fileName: fileName.split("/").pop() || fileName,
							filePath: fileName,
							language,
							functions,
							content: fileContent,
						} as FileNodeData,
					};
					nodes.push(fileNode);
				});

				// Create trigger nodes and edges
				triggers.forEach((trigger, index) => {
					const triggerNode: WorkflowNode = {
						id: `trigger-${trigger.triggerId}`,
						type: "trigger",
						position: { x: 300, y: 100 + index * 120 },
						data: {
							triggerId: trigger.triggerId || "",
							name: trigger.name || "Unnamed Trigger",
							triggerType: trigger.connectionId
								? "connection"
								: trigger.schedule
									? "schedule"
									: "webhook",
							connectionId: trigger.connectionId,
							entrypoint: trigger.entrypoint,
							filePath: trigger.path,
							functionName: trigger.entryFunction,
							schedule: trigger.schedule,
							webhookSlug: trigger.webhookSlug,
							eventType: trigger.eventType,
							filter: trigger.filter,
						} as TriggerNodeData,
					};
					nodes.push(triggerNode);

					// Create edge from connection to trigger (if connection-based)
					if (trigger.connectionId) {
						const connectionNodeId = `connection-${trigger.connectionId}`;
						if (nodes.some((n) => n.id === connectionNodeId)) {
							edges.push({
								id: `edge-${connectionNodeId}-to-${triggerNode.id}`,
								source: connectionNodeId,
								target: triggerNode.id,
								type: "trigger",
								animated: true,
								data: { triggerType: "connection" },
							});
						}
					}

					// Create edge from trigger to file (if has entrypoint)
					if (trigger.path) {
						const fileNodeId = `file-${trigger.path}`;
						if (nodes.some((n) => n.id === fileNodeId)) {
							edges.push({
								id: `edge-${triggerNode.id}-to-${fileNodeId}`,
								source: triggerNode.id,
								target: fileNodeId,
								type: "trigger",
								animated: true,
								label: trigger.entryFunction || "",
								data: { label: trigger.entryFunction },
							});
						}
					}
				});

				// Create variable nodes
				variables.forEach((variable, index) => {
					const variableNode: WorkflowNode = {
						id: `variable-${variable.scopeId}-${variable.name}`,
						type: "variable",
						position: { x: 800, y: 100 + index * 100 },
						data: {
							variableId: `${variable.scopeId}-${variable.name}`,
							name: variable.name,
							value: variable.isSecret ? "••••••••" : variable.value,
							isSecret: variable.isSecret || false,
						} as VariableNodeData,
					};
					nodes.push(variableNode);
				});

				// Apply auto-layout to organize nodes nicely
				const layoutedNodes = calculateAutoLayout(nodes, edges);

				state.nodes = layoutedNodes;
				state.edges = edges;
				state.isLoading = false;
				state.isDirty = false;

				// Save initial state to history
				state.history = [
					{
						nodes: JSON.parse(JSON.stringify(layoutedNodes)),
						edges: JSON.parse(JSON.stringify(edges)),
						viewport: { ...state.viewport },
					},
				];
				state.historyIndex = 0;
			}),

		// Sync changes back to backend
		syncToBackend: async (): Promise<SyncResult> => {
			const { currentProjectId, originalData, nodes } = get();
			const result: SyncResult = {
				success: true,
				triggersUpdated: 0,
				triggersCreated: 0,
				triggersDeleted: 0,
				errors: [],
			};

			if (!currentProjectId || !originalData) {
				result.success = false;
				result.errors.push(
					t("workflowCanvas.noProjectLoaded", { ns: "errors", defaultValue: "No project loaded" })
				);
				return result;
			}

			set((s) => {
				s.isSyncing = true;
			});

			try {
				// Get current trigger nodes from the canvas
				const triggerNodes = nodes.filter((n) => n.type === "trigger");
				const currentTriggerIds = new Set(
					triggerNodes
						.map((n) => (n.data as TriggerNodeData).triggerId)
						.filter((id) => id && !id.startsWith("new-"))
				);

				// Get original trigger IDs
				const originalTriggerIds = new Set(originalData.triggers.map((t) => t.triggerId).filter((id) => id));

				// Find triggers to delete (in original but not in current)
				const triggersToDelete = originalData.triggers.filter(
					(t) => t.triggerId && !currentTriggerIds.has(t.triggerId)
				);

				// Find triggers to create (new nodes without backend ID)
				const triggersToCreate = triggerNodes.filter((n) => {
					const data = n.data as TriggerNodeData;
					return !data.triggerId || data.triggerId.startsWith("new-");
				});

				// Find triggers to update (in both but potentially modified)
				const triggersToUpdate = triggerNodes.filter((n) => {
					const data = n.data as TriggerNodeData;
					return (
						data.triggerId && !data.triggerId.startsWith("new-") && originalTriggerIds.has(data.triggerId)
					);
				});

				// Delete triggers
				for (const trigger of triggersToDelete) {
					if (trigger.triggerId) {
						const { error } = await TriggersService.delete(trigger.triggerId);
						if (error) {
							result.errors.push(`Failed to delete trigger ${trigger.name}: ${error}`);
						} else {
							result.triggersDeleted++;
						}
					}
				}

				// Create new triggers
				for (const node of triggersToCreate) {
					const data = node.data as TriggerNodeData;
					const newTrigger: Trigger = {
						name: data.name,
						connectionId: data.connectionId,
						entryFunction: data.functionName,
						path: data.filePath,
						eventType: data.eventType || "",
						filter: data.filter,
						schedule: data.schedule,
						webhookSlug: data.webhookSlug,
					};

					const { data: triggerId, error } = await TriggersService.create(currentProjectId, newTrigger);
					if (error) {
						result.errors.push(`Failed to create trigger ${data.name}: ${error}`);
					} else if (triggerId) {
						result.triggersCreated++;
						// Update the node with the new ID
						set((s) => {
							const nodeIndex = s.nodes.findIndex((n) => n.id === node.id);
							if (nodeIndex !== -1) {
								(s.nodes[nodeIndex].data as TriggerNodeData).triggerId = triggerId;
							}
						});
					}
				}

				// Update existing triggers
				for (const node of triggersToUpdate) {
					const data = node.data as TriggerNodeData;
					const originalTrigger = originalData.triggers.find((t) => t.triggerId === data.triggerId);

					// Check if trigger data has changed
					if (originalTrigger) {
						const hasChanges =
							originalTrigger.name !== data.name ||
							originalTrigger.connectionId !== data.connectionId ||
							originalTrigger.entryFunction !== data.functionName ||
							originalTrigger.path !== data.filePath ||
							originalTrigger.eventType !== data.eventType ||
							originalTrigger.filter !== data.filter ||
							originalTrigger.schedule !== data.schedule;

						if (hasChanges) {
							const updatedTrigger: Trigger = {
								triggerId: data.triggerId,
								name: data.name,
								connectionId: data.connectionId,
								entryFunction: data.functionName,
								path: data.filePath,
								eventType: data.eventType || "",
								filter: data.filter,
								schedule: data.schedule,
								webhookSlug: data.webhookSlug,
							};

							const { error } = await TriggersService.update(currentProjectId, updatedTrigger);
							if (error) {
								result.errors.push(`Failed to update trigger ${data.name}: ${error}`);
							} else {
								result.triggersUpdated++;
							}
						}
					}
				}

				// Update result status
				result.success = result.errors.length === 0;

				// Show toast notification
				if (result.success) {
					const total = result.triggersCreated + result.triggersUpdated + result.triggersDeleted;
					if (total > 0) {
						useToastStore.getState().addToast({
							message: t("workflowCanvas.syncSuccess", {
								ns: "toasts",
								defaultValue: `Workflow saved successfully (${total} changes)`,
								count: total,
							}),
							type: "success",
						});
					} else {
						useToastStore.getState().addToast({
							message: t("workflowCanvas.noChanges", {
								ns: "toasts",
								defaultValue: "No changes to save",
							}),
							type: "info",
						});
					}
				} else {
					useToastStore.getState().addToast({
						message: t("workflowCanvas.syncError", {
							ns: "toasts",
							defaultValue: `Failed to save some changes: ${result.errors.length} errors`,
							count: result.errors.length,
						}),
						type: "error",
					});
				}

				// Update original data to reflect current state
				if (result.success) {
					set((s) => {
						s.isDirty = false;
						// Update original data with current state
						if (s.originalData) {
							const currentTriggers = s.nodes
								.filter((n) => n.type === "trigger")
								.map((n) => {
									const data = n.data as TriggerNodeData;
									return {
										triggerId: data.triggerId,
										name: data.name,
										connectionId: data.connectionId,
										entryFunction: data.functionName,
										path: data.filePath,
										eventType: data.eventType || "",
										filter: data.filter,
										schedule: data.schedule,
										webhookSlug: data.webhookSlug,
									} as Trigger;
								});
							s.originalData.triggers = currentTriggers;
						}
					});
				}

				return result;
			} catch (error) {
				result.success = false;
				result.errors.push(`Unexpected error: ${(error as Error).message}`);

				useToastStore.getState().addToast({
					message: t("workflowCanvas.syncUnexpectedError", {
						ns: "toasts",
						defaultValue: "An unexpected error occurred while saving",
					}),
					type: "error",
				});

				return result;
			} finally {
				set((s) => {
					s.isSyncing = false;
				});
			}
		},

		// Reset the canvas state
		reset: () =>
			set((state) => {
				state.nodes = [];
				state.edges = [];
				state.viewport = initialViewport;
				state.selectedNodes = [];
				state.selectedEdges = [];
				state.currentProjectId = null;
				state.originalData = null;
				state.history = [];
				state.historyIndex = -1;
				state.isDirty = false;
				state.isLoading = false;
				state.isSyncing = false;
			}),
	}))
);
