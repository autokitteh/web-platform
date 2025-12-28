import React, { useCallback, DragEvent, useMemo } from "react";

import {
	ReactFlow,
	Background,
	Controls,
	Connection,
	useNodesState,
	useEdgesState,
	addEdge,
	NodeTypes,
	OnConnect,
	OnNodesChange,
	OnEdgesChange,
	EdgeMouseHandler,
	Node,
	Edge,
	MarkerType,
	useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CodeEdge } from "./codeEdge";
import { IntegrationNode } from "./integrationNode";
import { IntegrationNodeData, WorkflowEdge, WorkflowNode } from "@interfaces/components/workflowBuilder.interface";
import { ModalName } from "@src/enums";
import { fitleredIntegrationsMap, Integrations } from "@src/enums/components";
import { useModalStore } from "@store/useModalStore";
import { useWorkflowBuilderStore } from "@store/useWorkflowBuilderStore";

const nodeTypes: NodeTypes = {
	integration: IntegrationNode,
};

const edgeTypes = {
	code: CodeEdge,
};

export const WorkflowCanvas = () => {
	const { nodes: storeNodes, edges: storeEdges, setNodes, setEdges, setSelectedEdgeId } = useWorkflowBuilderStore();
	const { openModal } = useModalStore();
	const { screenToFlowPosition } = useReactFlow();

	const [, , onNodesChange] = useNodesState(storeNodes as Node[]);
	const [, , onEdgesChange] = useEdgesState(storeEdges as Edge[]);

	const handleNodesChange: OnNodesChange = useCallback(
		(changes) => {
			onNodesChange(changes);
			const updatedNodes = [...storeNodes];
			changes.forEach((change) => {
				if (change.type === "position" && change.position) {
					const nodeIndex = updatedNodes.findIndex((n) => n.id === change.id);
					if (nodeIndex !== -1) {
						updatedNodes[nodeIndex] = {
							...updatedNodes[nodeIndex],
							position: change.position,
						};
					}
				}
			});
			setNodes(updatedNodes);
		},
		[storeNodes, onNodesChange, setNodes]
	);

	const handleEdgesChange: OnEdgesChange = useCallback(
		(changes) => {
			onEdgesChange(changes);
		},
		[onEdgesChange]
	);

	const onConnect: OnConnect = useCallback(
		(connection: Connection) => {
			const sourceNode = storeNodes.find((n) => n.id === connection.source);
			const sourceIntegration = sourceNode?.data?.integration;

			const newEdge: WorkflowEdge = {
				id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
				source: connection.source!,
				target: connection.target!,
				sourceHandle: connection.sourceHandle,
				targetHandle: connection.targetHandle,
				type: "code",
				animated: true,
				style: { stroke: "#22c55e", strokeWidth: 2 },
				markerEnd: {
					type: MarkerType.ArrowClosed,
					color: "#22c55e",
				},
				data: { code: "", eventType: "" },
			};

			const updatedEdges = addEdge(newEdge as Edge, storeEdges as Edge[]) as WorkflowEdge[];
			setEdges(updatedEdges);
			setSelectedEdgeId(newEdge.id);
			openModal(ModalName.connectionCodeEditor, { edgeId: newEdge.id, sourceIntegration });
		},
		[storeNodes, storeEdges, setEdges, setSelectedEdgeId, openModal]
	);

	const onEdgeClick: EdgeMouseHandler = useCallback(
		(_, edge) => {
			const sourceNode = storeNodes.find((n) => n.id === edge.source);
			const sourceIntegration = sourceNode?.data?.integration;
			setSelectedEdgeId(edge.id);
			openModal(ModalName.connectionCodeEditor, { edgeId: edge.id, sourceIntegration });
		},
		[storeNodes, setSelectedEdgeId, openModal]
	);

	const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(event: DragEvent<HTMLDivElement>) => {
			event.preventDefault();

			const data = event.dataTransfer.getData("application/reactflow");
			if (!data) return;

			const { value: integrationValue, label } = JSON.parse(data) as { label: string; value: string };
			const integration = fitleredIntegrationsMap[integrationValue as Integrations];
			if (!integration) return;

			const position = screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			const nodeData: IntegrationNodeData = {
				integration: integrationValue as Integrations,
				label,
			};

			const newNode: WorkflowNode = {
				id: `node-${integrationValue}-${Date.now()}`,
				type: "integration",
				position,
				data: nodeData,
			};

			setNodes([...storeNodes, newNode]);
		},
		[storeNodes, setNodes, screenToFlowPosition]
	);

	const memoizedNodes = useMemo(() => storeNodes as Node[], [storeNodes]);
	const memoizedEdges = useMemo(() => storeEdges as Edge[], [storeEdges]);

	return (
		<div className="size-full">
			<ReactFlow
				defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
				edgeTypes={edgeTypes}
				edges={memoizedEdges}
				nodeTypes={nodeTypes}
				nodes={memoizedNodes}
				onConnect={onConnect}
				onDragOver={onDragOver}
				onDrop={onDrop}
				onEdgeClick={onEdgeClick}
				onEdgesChange={handleEdgesChange}
				onNodesChange={handleNodesChange}
			>
				<Background color="#374151" gap={20} />
				<Controls className="!border-gray-700 !bg-gray-900 [&>button:hover]:!bg-gray-700 [&>button]:!border-gray-700 [&>button]:!bg-gray-800 [&>button]:!text-white" />
			</ReactFlow>
		</div>
	);
};
