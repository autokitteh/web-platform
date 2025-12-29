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
	EdgeTypes,
	OnConnect,
	OnNodesChange,
	OnEdgesChange,
	Node,
	Edge,
	MarkerType,
	useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CodeEdge } from "./codeEdge";
import { DataEdge, ExecutionEdge } from "./edges";
import { IntegrationNode } from "./integrationNode";
import { CodeNode, ConnectionNode, TriggerNode } from "./nodes";
import {
	CodeNodeData,
	ConnectionNodeData,
	DataEdgeData,
	ExecutionEdgeData,
	LegacyWorkflowEdgeData,
	TriggerNodeData,
	WorkflowEdge,
	WorkflowNode,
} from "@interfaces/components/workflowBuilder.interface";
import { ModalName } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useModalStore } from "@store/useModalStore";
import { useWorkflowBuilderStore } from "@store/useWorkflowBuilderStore";

const nodeTypes: NodeTypes = {
	integration: IntegrationNode,
	trigger: TriggerNode,
	code: CodeNode,
	connection: ConnectionNode,
};

const edgeTypes: EdgeTypes = {
	code: CodeEdge,
	execution: ExecutionEdge,
	data: DataEdge,
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
			const targetNode = storeNodes.find((n) => n.id === connection.target);

			if (!sourceNode || !targetNode) return;

			let edgeType: string = "code";
			let edgeData: ExecutionEdgeData | DataEdgeData | LegacyWorkflowEdgeData;

			if (sourceNode.type === "trigger" && targetNode.type === "code") {
				edgeType = "execution";
				const triggerData = sourceNode.data as TriggerNodeData;
				edgeData = {
					type: "execution",
					functionCall: triggerData.call?.split(":")[1] || "main",
					isActive: triggerData.status === "configured",
				} as ExecutionEdgeData;
			} else if (
				(sourceNode.type === "code" && targetNode.type === "connection") ||
				(sourceNode.type === "connection" && targetNode.type === "code")
			) {
				edgeType = "data";
				edgeData = {
					type: "data",
					operations: [],
				} as DataEdgeData;
			} else {
				edgeData = {
					code: "",
					eventType: "",
					variables: [],
					status: "draft",
				} as LegacyWorkflowEdgeData;
			}

			const newEdge = {
				id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
				source: connection.source!,
				target: connection.target!,
				sourceHandle: connection.sourceHandle,
				targetHandle: connection.targetHandle,
				type: edgeType,
				animated: edgeType === "execution",
				markerEnd: {
					type: MarkerType.ArrowClosed,
					color: edgeType === "execution" ? "#f59e0b" : "#22c55e",
				},
				data: edgeData,
			} as WorkflowEdge;

			const updatedEdges = addEdge(newEdge as Edge, storeEdges as Edge[]) as WorkflowEdge[];
			setEdges(updatedEdges);

			if (edgeType === "code") {
				setSelectedEdgeId(newEdge.id);
				openModal(ModalName.connectionCodeEditor, { edgeId: newEdge.id });
			}
		},
		[storeNodes, storeEdges, setEdges, setSelectedEdgeId, openModal]
	);

	const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(event: DragEvent<HTMLDivElement>) => {
			event.preventDefault();

			const workflowData = event.dataTransfer.getData("application/workflow-node");
			const reactFlowData = event.dataTransfer.getData("application/reactflow");

			const position = screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			if (workflowData) {
				const data = JSON.parse(workflowData);

				if (data.nodeType === "trigger") {
					const newNode: WorkflowNode = {
						id: `trigger-${data.triggerType}-${Date.now()}`,
						type: "trigger",
						position,
						data: {
							type: data.triggerType,
							name: `${data.triggerType}_trigger`,
							call: "",
							isDurable: true,
							status: "draft",
						} as TriggerNodeData,
					};
					setNodes([...storeNodes, newNode]);
					openModal(ModalName.triggerConfig, { nodeId: newNode.id });
				} else if (data.nodeType === "code") {
					const newNode: WorkflowNode = {
						id: `code-${Date.now()}`,
						type: "code",
						position,
						data: {
							fileName: data.fileName,
							filePath: data.filePath,
							language: data.language,
							entryPoints: data.entryPoints || [],
							usedConnections: [],
							status: "draft",
						} as CodeNodeData,
					};
					setNodes([...storeNodes, newNode]);
				} else if (data.nodeType === "connection") {
					const connectionName = data.isExisting
						? data.connectionName
						: `${data.integration}_conn_${Date.now().toString(36)}`;

					const newNode: WorkflowNode = {
						id: `connection-${connectionName}-${Date.now()}`,
						type: "connection",
						position,
						data: {
							connectionName,
							integration: data.integration as Integrations,
							displayName: data.displayName,
							status: data.isExisting ? "connected" : "disconnected",
							usedByFunctions: [],
						} as ConnectionNodeData,
					};
					setNodes([...storeNodes, newNode]);

					if (!data.isExisting) {
						openModal(ModalName.connectionConfig, { nodeId: newNode.id, connectionName });
					}
				}
			} else if (reactFlowData) {
				const { value: integrationValue, label } = JSON.parse(reactFlowData);

				const newNode: WorkflowNode = {
					id: `node-${integrationValue}-${Date.now()}`,
					type: "integration",
					position,
					data: {
						integration: integrationValue as Integrations,
						label,
					},
				};

				setNodes([...storeNodes, newNode]);
			}
		},
		[storeNodes, setNodes, screenToFlowPosition, openModal]
	);

	const memoizedNodes = useMemo(() => storeNodes as Node[], [storeNodes]);
	const memoizedEdges = useMemo(() => storeEdges as Edge[], [storeEdges]);

	return (
		<div className="size-full">
			<ReactFlow
				defaultViewport={{ x: 100, y: 50, zoom: 0.8 }}
				edgeTypes={edgeTypes}
				edges={memoizedEdges}
				nodeTypes={nodeTypes}
				nodes={memoizedNodes}
				onConnect={onConnect}
				onDragOver={onDragOver}
				onDrop={onDrop}
				onEdgesChange={handleEdgesChange}
				onNodesChange={handleNodesChange}
			>
				<Background color="#374151" gap={20} />
				<Controls className="!border-gray-700 !bg-gray-900 [&>button:hover]:!bg-gray-700 [&>button]:!border-gray-700 [&>button]:!bg-gray-800 [&>button]:!text-white" />
			</ReactFlow>
		</div>
	);
};
