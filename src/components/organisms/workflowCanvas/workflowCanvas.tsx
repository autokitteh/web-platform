import React, { memo, useCallback, useEffect, useRef, useState, DragEvent } from "react";

import {
	ReactFlow,
	Background,
	Controls,
	MiniMap,
	Panel,
	useNodesState,
	useEdgesState,
	addEdge,
	Connection,
	useReactFlow,
	ReactFlowProvider,
	BackgroundVariant,
	OnNodesChange,
	OnEdgesChange,
	OnConnect,
	ConnectionLineType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { edgeTypes } from "./edges";
import { nodeTypes } from "./nodes";
import { WorkflowSidebar } from "./sidebar";
import {
	WorkflowCanvasProps,
	WorkflowNode,
	WorkflowEdge,
	DragItem,
} from "@interfaces/store/workflowCanvasStore.interface";
import { useWorkflowCanvasStore } from "@store/useWorkflowCanvasStore";
import { canConnect, createNodeFromDrop } from "@store/utils/workflowCanvasUtils";
import { cn } from "@utilities";

import { useCacheStore } from "@store";

import { IconSvg } from "@components/atoms";
import { Loader } from "@components/atoms/loader";

import { UndoIcon, RedoIcon, FitViewIcon, SaveIcon, LayoutIcon } from "@assets/image/icons";

// Inner component that has access to React Flow context
const WorkflowCanvasInner = memo(function WorkflowCanvasInner({
	projectId,
	className,
	readOnly = false,
}: WorkflowCanvasProps) {
	// React Flow hooks for node and edge state management
	// These provide optimized updates for the canvas elements
	const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>([]);

	// Reference to the canvas wrapper for drop position calculations
	const reactFlowWrapper = useRef<HTMLDivElement>(null);

	// React Flow instance for programmatic control
	const { screenToFlowPosition, fitView } = useReactFlow();

	// Zustand stores for canvas state and project data
	const workflowStore = useWorkflowCanvasStore();
	const cacheStore = useCacheStore();

	// Local state
	const [isInitialized, setIsInitialized] = useState(false);

	// Initialize canvas with project data when component mounts
	useEffect(() => {
		const initializeCanvas = async () => {
			if (!projectId || isInitialized) return;

			workflowStore.setLoading(true);

			// Fetch project data from cache store if not already loaded
			await cacheStore.initCache(projectId);

			// Get the data from the cache
			const connections = cacheStore.connections || [];
			const triggers = cacheStore.triggers || [];
			const resources = cacheStore.resources || {};
			const variables = cacheStore.variables || [];

			// Initialize the workflow canvas store with this data
			workflowStore.initFromProject(projectId, connections, triggers, resources, variables);

			// Copy the initialized nodes and edges to local React Flow state
			setNodes(workflowStore.nodes);
			setEdges(workflowStore.edges);

			setIsInitialized(true);
			workflowStore.setLoading(false);

			// Fit the view to show all nodes after a brief delay for rendering
			setTimeout(() => {
				fitView({ padding: 0.2, duration: 500 });
			}, 100);
		};

		initializeCanvas();
	}, [projectId]);

	// Sync local state changes back to the Zustand store
	useEffect(() => {
		if (isInitialized && nodes.length > 0) {
			workflowStore.setNodes(nodes as WorkflowNode[]);
		}
	}, [nodes, isInitialized]);

	useEffect(() => {
		if (isInitialized) {
			workflowStore.setEdges(edges as WorkflowEdge[]);
		}
	}, [edges, isInitialized]);

	// Handle new connections between nodes
	// This validates the connection based on node types before creating it
	const onConnect: OnConnect = useCallback(
		(connection: Connection) => {
			// Find the source and target nodes to validate the connection
			const sourceNode = nodes.find((n) => n.id === connection.source);
			const targetNode = nodes.find((n) => n.id === connection.target);

			if (!sourceNode || !targetNode) return;

			// Validate that this connection type is allowed
			if (!canConnect(sourceNode.type || "", targetNode.type || "")) {
				// Could show a toast here explaining why the connection isn't allowed
				return;
			}

			// Create the new edge with our custom trigger type
			const newEdge: WorkflowEdge = {
				...connection,
				id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
				type: "trigger",
				animated: true,
			};

			setEdges((eds) => addEdge(newEdge, eds));
			workflowStore.saveToHistory();
		},
		[nodes, setEdges, workflowStore]
	);

	// Handle drag over event - needed to allow drop
	const onDragOver = useCallback((event: DragEvent) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	// Handle drop event - create a new node at the drop position
	const onDrop = useCallback(
		(event: DragEvent) => {
			event.preventDefault();

			// Get the item data from the drag event
			const itemData = event.dataTransfer.getData("application/reactflow");
			if (!itemData) return;

			const item: DragItem = JSON.parse(itemData);

			// Calculate the position in the flow coordinate system
			// This accounts for zoom and pan transformations
			const position = screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			// Create the new node
			const newNode = createNodeFromDrop(item.type, position, item.data || {});

			// Add the node to the canvas
			setNodes((nds) => [...nds, newNode]);
			workflowStore.saveToHistory();
		},
		[screenToFlowPosition, setNodes, workflowStore]
	);

	// Handle drag start from sidebar - eslint-disable for intentionally unused params
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const onDragStart = useCallback((_event: DragEvent, _item: DragItem) => {
		// Item data is passed through dataTransfer, no need to track here
	}, []);

	// Toolbar actions
	const handleUndo = useCallback(() => {
		workflowStore.undo();
		setNodes(workflowStore.nodes);
		setEdges(workflowStore.edges);
	}, [workflowStore, setNodes, setEdges]);

	const handleRedo = useCallback(() => {
		workflowStore.redo();
		setNodes(workflowStore.nodes);
		setEdges(workflowStore.edges);
	}, [workflowStore, setNodes, setEdges]);

	const handleFitView = useCallback(() => {
		fitView({ padding: 0.2, duration: 500 });
	}, [fitView]);

	const handleSave = useCallback(async () => {
		await workflowStore.syncToBackend();
	}, [workflowStore]);

	const handleAutoLayout = useCallback(() => {
		// Trigger auto-layout by re-initializing from store data
		const connections = cacheStore.connections || [];
		const triggers = cacheStore.triggers || [];
		const resources = cacheStore.resources || {};
		const variables = cacheStore.variables || [];

		workflowStore.initFromProject(projectId, connections, triggers, resources, variables);

		setNodes(workflowStore.nodes);
		setEdges(workflowStore.edges);

		setTimeout(() => {
			fitView({ padding: 0.2, duration: 500 });
		}, 100);
	}, [projectId, cacheStore, workflowStore, setNodes, setEdges, fitView]);

	// Get project data for sidebar
	const resources = cacheStore.resources || {};
	const variables = cacheStore.variables || [];

	// Show loading state while initializing
	if (workflowStore.isLoading) {
		return (
			<div className={cn("flex h-full items-center justify-center", "bg-gray-950", className)}>
				<Loader />
			</div>
		);
	}

	return (
		<div className={cn("flex h-full", className)}>
			{/* Sidebar for dragging items onto canvas */}
			{!readOnly ? (
				<WorkflowSidebar
					isOpen={workflowStore.isSidebarOpen}
					onDragStart={onDragStart}
					onToggle={workflowStore.toggleSidebar}
					resources={resources}
					sections={[]}
					variables={variables}
				/>
			) : null}

			{/* Main canvas area */}
			<div className="h-full flex-1" onDragOver={onDragOver} onDrop={onDrop} ref={reactFlowWrapper}>
				<ReactFlow
					className="bg-gray-950"
					edges={edges}
					fitViewOptions={{ padding: 0.2 }}
					minZoom={0.1}
					nodeTypes={nodeTypes}
					nodes={nodes}
					nodesConnectable={!readOnly}
					onConnect={onConnect}
					onEdgesChange={onEdgesChange as OnEdgesChange}
					onNodesChange={onNodesChange as OnNodesChange}
					connectionLineType={ConnectionLineType.Bezier}
					// Default edge options
					defaultEdgeOptions={{
						type: "trigger",
						animated: true,
					}}
					edgeTypes={edgeTypes}
					// Canvas behavior settings
					fitView
					elementsSelectable={true}
					// Visual settings
					snapToGrid={true}
					maxZoom={2}
					// Interaction settings
					nodesDraggable={!readOnly}
					// Styling
					snapGrid={[16, 16]}
					// Connection line styling
					connectionLineStyle={{ stroke: "#f59e0b", strokeWidth: 2 }}
				>
					{/* Background pattern - creates the grid effect */}
					<Background
						className="bg-gray-950"
						color="#374151"
						gap={20}
						size={1}
						variant={BackgroundVariant.Dots}
					/>

					{/* Zoom and pan controls */}
					<Controls
						className="!rounded-xl !border-gray-700 !bg-gray-900 !shadow-xl"
						showInteractive={false}
					/>

					{/* Minimap for navigation */}
					<MiniMap
						className="!rounded-xl !border-gray-700 !bg-gray-900/90"
						maskColor="rgba(0, 0, 0, 0.7)"
						nodeColor={(node) => {
							switch (node.type) {
								case "connection":
									return "#10b981"; // emerald
								case "file":
									return "#3b82f6"; // blue
								case "trigger":
									return "#f59e0b"; // amber
								case "variable":
									return "#a855f7"; // purple
								default:
									return "#6b7280"; // gray
							}
						}}
					/>

					{/* Toolbar panel - top right */}
					{!readOnly ? (
						<Panel className="flex items-center gap-2" position="top-right">
							{/* Undo button */}
							<ToolbarButton
								disabled={workflowStore.historyIndex <= 0}
								icon={UndoIcon}
								onClick={handleUndo}
								tooltip="Undo (Ctrl+Z)"
							/>

							{/* Redo button */}
							<ToolbarButton
								disabled={workflowStore.historyIndex >= workflowStore.history.length - 1}
								icon={RedoIcon}
								onClick={handleRedo}
								tooltip="Redo (Ctrl+Shift+Z)"
							/>

							<div className="mx-1 h-6 w-px bg-gray-700" />

							{/* Fit view button */}
							<ToolbarButton icon={FitViewIcon} onClick={handleFitView} tooltip="Fit to view" />

							{/* Auto-layout button */}
							<ToolbarButton icon={LayoutIcon} onClick={handleAutoLayout} tooltip="Auto-arrange nodes" />

							<div className="mx-1 h-6 w-px bg-gray-700" />

							{/* Save button */}
							<ToolbarButton
								disabled={!workflowStore.isDirty}
								icon={SaveIcon}
								onClick={handleSave}
								tooltip="Save changes"
								variant={workflowStore.isDirty ? "primary" : "default"}
							/>
						</Panel>
					) : null}

					{/* Status panel - bottom left */}
					<Panel
						className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/80 px-3 py-2 backdrop-blur-sm"
						position="bottom-left"
					>
						<span className="text-xs text-gray-500">
							{nodes.length} nodes · {edges.length} connections
						</span>
						{workflowStore.isDirty ? (
							<span className="text-xs text-amber-400">• Unsaved changes</span>
						) : null}
					</Panel>
				</ReactFlow>
			</div>
		</div>
	);
});

// Toolbar button component for consistent styling
interface ToolbarButtonProps {
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	onClick: () => void;
	disabled?: boolean;
	tooltip?: string;
	variant?: "default" | "primary";
}

const ToolbarButton = memo(function ToolbarButton({
	icon: Icon,
	onClick,
	disabled = false,
	tooltip,
	variant = "default",
}: ToolbarButtonProps) {
	return (
		<button
			className={cn(
				"rounded-lg p-2 transition-all duration-200",
				"border border-gray-700",
				disabled && "cursor-not-allowed opacity-40",
				!disabled &&
					variant === "default" && ["bg-gray-900 hover:bg-gray-800", "text-gray-400 hover:text-white"],
				!disabled && variant === "primary" && ["bg-amber-600 hover:bg-amber-500", "border-amber-500 text-white"]
			)}
			disabled={disabled}
			onClick={onClick}
			title={tooltip}
			type="button"
		>
			<IconSvg className="size-4" src={Icon} />
		</button>
	);
});

// Main exported component wrapped with ReactFlowProvider
// The provider is required for the React Flow hooks to work
export const WorkflowCanvas = memo(function WorkflowCanvas(props: WorkflowCanvasProps) {
	return (
		<ReactFlowProvider>
			<WorkflowCanvasInner {...props} />
		</ReactFlowProvider>
	);
});

export default WorkflowCanvas;
