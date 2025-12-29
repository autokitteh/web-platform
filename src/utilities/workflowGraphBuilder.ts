import { XYPosition } from "@xyflow/react";

import { TriggerTypes } from "@enums";
import {
	TriggerNode,
	CodeNode,
	ConnectionNode,
	WorkflowNode,
	WorkflowEdge,
	ExecutionEdge,
	DataEdge,
	ProjectVariable,
	TriggerType,
	NodeStatus,
	ConnectionStatus,
	EntryPoint,
	ExecutionEdgeData,
	DataEdgeData,
} from "@interfaces/components/workflowBuilder.interface";
import { ExistingCodeFile, ProjectWorkflowData } from "@services/workflowBuilder.service";
import { Integrations, IntegrationsMap } from "@src/enums/components/connection.enum";
import { Trigger, Connection, Variable } from "@type/models";
import { parseEntryPoints, ParsedEntryPoint } from "@utilities/codeParser";
import { analyzeConnectionUsage, ConnectionUsage } from "@utilities/connectionAnalyzer";

export type GraphBuildWarningType =
	| "orphan_trigger"
	| "unused_connection"
	| "missing_entry_point"
	| "circular_dependency"
	| "invalid_connection_ref";

export interface GraphBuildWarning {
	type: GraphBuildWarningType;
	message: string;
	affectedIds: string[];
}

export interface GraphBuildResult {
	nodes: WorkflowNode[];
	edges: WorkflowEdge[];
	variables: ProjectVariable[];
	warnings: GraphBuildWarning[];
}

export interface GraphBuildContext {
	codeNodesByFile: Map<string, CodeNode>;
	connectionNodesByName: Map<string, ConnectionNode>;
	triggerNodes: TriggerNode[];
	activeFunctions: Set<string>;
	connectionUsageMap: Map<string, ConnectionUsage[]>;
}

const defaultPosition: XYPosition = { x: 0, y: 0 };

export function buildWorkflowGraph(data: ProjectWorkflowData): GraphBuildResult {
	const warnings: GraphBuildWarning[] = [];
	const context: GraphBuildContext = {
		codeNodesByFile: new Map(),
		connectionNodesByName: new Map(),
		triggerNodes: [],
		activeFunctions: new Set(),
		connectionUsageMap: new Map(),
	};

	const activeFunctions = extractActiveFunctions(data.triggers);
	context.activeFunctions = activeFunctions;

	const codeNodes = createCodeNodes(data.files, activeFunctions, data.connections, context);
	const connectionNodes = createConnectionNodes(data.connections, context);
	const triggerNodes = createTriggerNodes(data.triggers, context, warnings);
	const variables = convertVariables(data.variables);

	detectWarnings(context, warnings);

	const nodes: WorkflowNode[] = [...triggerNodes, ...codeNodes, ...connectionNodes];

	const executionEdges = createExecutionEdges(triggerNodes, codeNodes, data.triggers);
	const dataEdges = createDataEdges(codeNodes, connectionNodes, context);
	const edges: WorkflowEdge[] = [...executionEdges, ...dataEdges];

	return {
		nodes,
		edges,
		variables,
		warnings,
	};
}

function extractActiveFunctions(triggers: Trigger[]): Set<string> {
	const activeFunctions = new Set<string>();

	triggers.forEach((trigger) => {
		if (trigger.entryFunction) {
			activeFunctions.add(trigger.entryFunction);
		}

		if (trigger.path && trigger.entryFunction) {
			const fullPath = `${trigger.path}:${trigger.entryFunction}`;
			activeFunctions.add(fullPath);
		}
	});

	return activeFunctions;
}

function createCodeNodes(
	files: ExistingCodeFile[],
	activeFunctions: Set<string>,
	connections: Connection[],
	context: GraphBuildContext
): CodeNode[] {
	const connectionNames = connections.map((c) => c.name);

	return files.map((file) => {
		const entryPoints = parseFileEntryPoints(file, activeFunctions);
		const usedConnections = analyzeFileConnections(file, connectionNames, context);

		const node: CodeNode = {
			id: `code-${file.path.replace(/\//g, "-").replace(/\./g, "_")}`,
			type: "code",
			position: defaultPosition,
			data: {
				fileName: file.name,
				filePath: file.path,
				language: file.language,
				entryPoints,
				usedConnections,
				status: determineCodeNodeStatus(entryPoints),
			},
		};

		context.codeNodesByFile.set(file.path, node);
		context.codeNodesByFile.set(file.name, node);

		return node;
	});
}

function parseFileEntryPoints(file: ExistingCodeFile, activeFunctions: Set<string>): EntryPoint[] {
	if (file.exports && file.exports.length > 0) {
		return file.exports.map((exportName, index) => ({
			name: exportName,
			lineNumber: index + 1,
			isActive: activeFunctions.has(exportName) || activeFunctions.has(`${file.path}:${exportName}`),
		}));
	}

	if (file.content) {
		const parsed = parseEntryPoints(file.content, file.language);

		return parsed.map((ep: ParsedEntryPoint) => ({
			name: ep.name,
			lineNumber: ep.lineNumber,
			isActive: activeFunctions.has(ep.name) || activeFunctions.has(`${file.path}:${ep.name}`),
		}));
	}

	return [];
}

function analyzeFileConnections(
	file: ExistingCodeFile,
	connectionNames: string[],
	context: GraphBuildContext
): string[] {
	if (!file.content) {
		return [];
	}

	const usages = analyzeConnectionUsage(file.content, connectionNames);
	context.connectionUsageMap.set(file.path, usages);

	return usages.map((u) => u.connectionName);
}

function determineCodeNodeStatus(entryPoints: EntryPoint[]): NodeStatus {
	const hasActiveEntryPoints = entryPoints.some((ep) => ep.isActive);

	if (hasActiveEntryPoints) {
		return "active";
	}

	if (entryPoints.length > 0) {
		return "configured";
	}

	return "draft";
}

function createConnectionNodes(connections: Connection[], context: GraphBuildContext): ConnectionNode[] {
	return connections.map((connection) => {
		const integration = mapIntegrationName(connection.integrationUniqueName || connection.integrationId);
		const displayName = getIntegrationDisplayName(integration, connection.integrationName);
		const usedByFunctions = findFunctionsUsingConnection(connection.name, context);

		const node: ConnectionNode = {
			id: `connection-${connection.connectionId}`,
			type: "connection",
			position: defaultPosition,
			data: {
				connectionName: connection.name,
				integration,
				displayName,
				status: mapConnectionStatus(connection.status),
				usedByFunctions,
			},
		};

		context.connectionNodesByName.set(connection.name, node);

		return node;
	});
}

function mapIntegrationName(integrationName?: string): Integrations {
	if (!integrationName) {
		return Integrations.slack;
	}

	const normalizedName = integrationName.toLowerCase().replace(/-/g, "_");

	if (normalizedName in Integrations) {
		return normalizedName as Integrations;
	}

	const integrationValues = Object.values(Integrations);
	const match = integrationValues.find((v) => normalizedName.includes(v) || v.includes(normalizedName));

	return match || Integrations.slack;
}

function getIntegrationDisplayName(integration: Integrations, fallbackName?: string): string {
	const integrationInfo = IntegrationsMap[integration];

	return integrationInfo?.label || fallbackName || integration;
}

function mapConnectionStatus(status: string): ConnectionStatus {
	const statusMap: Record<string, ConnectionStatus> = {
		ok: "connected",
		valid: "connected",
		connected: "connected",
		active: "active",
		error: "error",
		invalid: "error",
		warning: "disconnected",
		disconnected: "disconnected",
	};

	return statusMap[status?.toLowerCase()] || "disconnected";
}

function findFunctionsUsingConnection(connectionName: string, context: GraphBuildContext): string[] {
	const functions: string[] = [];

	context.connectionUsageMap.forEach((usages) => {
		const usage = usages.find((u) => u.connectionName === connectionName);
		if (usage) {
			functions.push(...usage.functions);
		}
	});

	return [...new Set(functions)];
}

function createTriggerNodes(
	triggers: Trigger[],
	context: GraphBuildContext,
	warnings: GraphBuildWarning[]
): TriggerNode[] {
	return triggers.map((trigger) => {
		const triggerType = mapTriggerType(trigger.sourceType);
		const call = formatEntryPointCall(trigger.path, trigger.entryFunction);
		const status = determineTriggerStatus(trigger, context, warnings);

		const node: TriggerNode = {
			id: `trigger-${trigger.triggerId}`,
			type: "trigger",
			position: defaultPosition,
			data: {
				type: triggerType,
				name: trigger.name || `${triggerType} trigger`,
				schedule: trigger.schedule,
				webhookPath: trigger.webhookSlug,
				connectionRef: trigger.connectionId,
				eventType: trigger.eventType,
				eventFilter: trigger.filter,
				call,
				isDurable: trigger.isDurable ?? true,
				status,
			},
		};

		context.triggerNodes.push(node);

		return node;
	});
}

function mapTriggerType(sourceType?: TriggerTypes): TriggerType {
	if (!sourceType) {
		return "event";
	}

	const typeMap: Record<string, TriggerType> = {
		schedule: "schedule",
		webhook: "webhook",
		connection: "event",
	};

	return typeMap[sourceType] || "event";
}

function formatEntryPointCall(path?: string, functionName?: string): string {
	if (!functionName) {
		return "";
	}

	if (path) {
		return `${path}:${functionName}`;
	}

	return functionName;
}

function determineTriggerStatus(
	trigger: Trigger,
	context: GraphBuildContext,
	warnings: GraphBuildWarning[]
): NodeStatus {
	if (!trigger.entryFunction) {
		return "draft";
	}

	const targetFile = trigger.path;
	if (targetFile && !context.codeNodesByFile.has(targetFile)) {
		warnings.push({
			type: "orphan_trigger",
			message: `Trigger "${trigger.name || trigger.triggerId}" references non-existent file "${targetFile}"`,
			affectedIds: [trigger.triggerId || ""],
		});

		return "error";
	}

	if (targetFile) {
		const codeNode = context.codeNodesByFile.get(targetFile);
		if (codeNode) {
			const hasFunction = codeNode.data.entryPoints.some((ep) => ep.name === trigger.entryFunction);
			if (!hasFunction) {
				warnings.push({
					type: "missing_entry_point",
					message: `Trigger "${trigger.name || trigger.triggerId}" references non-existent function "${trigger.entryFunction}" in "${targetFile}"`,
					affectedIds: [trigger.triggerId || ""],
				});

				return "error";
			}
		}
	}

	if (trigger.connectionId && !context.connectionNodesByName.has(trigger.connectionId)) {
		warnings.push({
			type: "invalid_connection_ref",
			message: `Trigger "${trigger.name || trigger.triggerId}" references unknown connection "${trigger.connectionId}"`,
			affectedIds: [trigger.triggerId || ""],
		});
	}

	return "configured";
}

function convertVariables(variables: Variable[]): ProjectVariable[] {
	return variables.map((variable, index) => ({
		id: `var-${variable.scopeId || "project"}-${index}`,
		name: variable.name,
		value: variable.isSecret ? "••••••••" : variable.value,
		isSecret: variable.isSecret,
	}));
}

function detectWarnings(context: GraphBuildContext, warnings: GraphBuildWarning[]): void {
	context.connectionNodesByName.forEach((connectionNode, connectionName) => {
		if (connectionNode.data.usedByFunctions.length === 0) {
			const isUsedByTrigger = context.triggerNodes.some(
				(t) => t.data.connectionRef === connectionName || t.data.connectionRef === connectionNode.id
			);

			if (!isUsedByTrigger) {
				warnings.push({
					type: "unused_connection",
					message: `Connection "${connectionName}" is not used by any code or trigger`,
					affectedIds: [connectionNode.id],
				});
			}
		}
	});
}

export function getNodeById(nodes: WorkflowNode[], nodeId: string): WorkflowNode | undefined {
	return nodes.find((n) => n.id === nodeId);
}

export function getNodesByType<T extends WorkflowNode>(nodes: WorkflowNode[], type: string): T[] {
	return nodes.filter((n) => n.type === type) as T[];
}

export function getTriggerNodesFromResult(result: GraphBuildResult): TriggerNode[] {
	return getNodesByType<TriggerNode>(result.nodes, "trigger");
}

export function getCodeNodesFromResult(result: GraphBuildResult): CodeNode[] {
	return getNodesByType<CodeNode>(result.nodes, "code");
}

export function getConnectionNodesFromResult(result: GraphBuildResult): ConnectionNode[] {
	return getNodesByType<ConnectionNode>(result.nodes, "connection");
}

function createExecutionEdges(
	triggerNodes: TriggerNode[],
	codeNodes: CodeNode[],
	triggers: Trigger[]
): ExecutionEdge[] {
	const edges: ExecutionEdge[] = [];

	triggerNodes.forEach((triggerNode, index) => {
		const trigger = triggers[index];
		if (!trigger?.path && !trigger?.entryFunction) {
			return;
		}

		const targetFile = trigger.path;
		const functionName = trigger.entryFunction;

		let targetNode: CodeNode | undefined;

		if (targetFile) {
			targetNode = codeNodes.find((n) => n.data.filePath === targetFile || n.data.fileName === targetFile);
		}

		if (!targetNode && functionName) {
			targetNode = codeNodes.find((n) => n.data.entryPoints.some((ep) => ep.name === functionName));
		}

		if (!targetNode) {
			return;
		}

		const edge: ExecutionEdge = {
			id: `edge-exec-${triggerNode.id}-${targetNode.id}`,
			source: triggerNode.id,
			target: targetNode.id,
			sourceHandle: "bottom",
			targetHandle: "top",
			type: "execution",
			animated: true,
			data: {
				type: "execution",
				functionCall: functionName || "",
				isActive: triggerNode.data.status !== "error" && triggerNode.data.status !== "draft",
			} as ExecutionEdgeData,
		};

		edges.push(edge);
	});

	return edges;
}

function createDataEdges(
	codeNodes: CodeNode[],
	connectionNodes: ConnectionNode[],
	context: GraphBuildContext
): DataEdge[] {
	const edges: DataEdge[] = [];
	const createdEdges = new Set<string>();

	codeNodes.forEach((codeNode) => {
		const fileUsages = context.connectionUsageMap.get(codeNode.data.filePath) || [];

		codeNode.data.usedConnections.forEach((connectionName) => {
			const connectionNode = connectionNodes.find((n) => n.data.connectionName === connectionName);

			if (!connectionNode) {
				return;
			}

			const edgeKey = `${codeNode.id}-${connectionNode.id}`;
			if (createdEdges.has(edgeKey)) {
				return;
			}

			const usage = fileUsages.find((u) => u.connectionName === connectionName);
			const operations: DataEdgeData["operations"] =
				usage?.operations.map((op) => ({
					functionName: op.functionName,
					lineNumber: op.lineNumber,
					operationType: op.type,
				})) || [];

			const edge: DataEdge = {
				id: `edge-data-${codeNode.id}-${connectionNode.id}`,
				source: codeNode.id,
				target: connectionNode.id,
				sourceHandle: "right",
				targetHandle: "left",
				type: "data",
				data: {
					type: "data",
					operations,
				} as DataEdgeData,
			};

			edges.push(edge);
			createdEdges.add(edgeKey);
		});
	});

	return edges;
}

export function createEdgeBetweenNodes(
	sourceId: string,
	targetId: string,
	sourceType: string,
	targetType: string
): WorkflowEdge | null {
	const timestamp = Date.now();

	if (sourceType === "trigger" && targetType === "code") {
		return {
			id: `edge-exec-${sourceId}-${targetId}-${timestamp}`,
			source: sourceId,
			target: targetId,
			sourceHandle: "bottom",
			targetHandle: "top",
			type: "execution",
			animated: true,
			data: {
				type: "execution",
				functionCall: "",
				isActive: false,
			} as ExecutionEdgeData,
		} as ExecutionEdge;
	}

	if (
		(sourceType === "code" && targetType === "connection") ||
		(sourceType === "connection" && targetType === "code")
	) {
		return {
			id: `edge-data-${sourceId}-${targetId}-${timestamp}`,
			source: sourceId,
			target: targetId,
			sourceHandle: sourceType === "code" ? "right" : "left",
			targetHandle: sourceType === "code" ? "left" : "right",
			type: "data",
			data: {
				type: "data",
				operations: [],
			} as DataEdgeData,
		} as DataEdge;
	}

	return null;
}

export function getEdgesBySourceNode(edges: WorkflowEdge[], sourceId: string): WorkflowEdge[] {
	return edges.filter((e) => e.source === sourceId);
}

export function getEdgesByTargetNode(edges: WorkflowEdge[], targetId: string): WorkflowEdge[] {
	return edges.filter((e) => e.target === targetId);
}

export function getEdgesBetweenNodes(edges: WorkflowEdge[], nodeId1: string, nodeId2: string): WorkflowEdge[] {
	return edges.filter(
		(e) => (e.source === nodeId1 && e.target === nodeId2) || (e.source === nodeId2 && e.target === nodeId1)
	);
}

export function getExecutionEdges(edges: WorkflowEdge[]): ExecutionEdge[] {
	return edges.filter((e) => e.type === "execution") as ExecutionEdge[];
}

export function getDataEdges(edges: WorkflowEdge[]): DataEdge[] {
	return edges.filter((e) => e.type === "data") as DataEdge[];
}
