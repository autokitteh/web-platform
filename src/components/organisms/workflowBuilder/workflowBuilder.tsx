import React, { useEffect, useCallback } from "react";

import { ReactFlowProvider } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ConnectionEditorModal } from "./connectionEditorModal";
import { DeleteEdgeModal } from "./deleteEdgeModal";
import { DeleteNodeModal } from "./deleteNodeModal";
import { ConnectionConfigModal, TriggerConfigModal } from "./modals";
import { WorkflowSidebar } from "./sidebar";
import { WorkflowBuilderError } from "./workflowBuilderError";
import { WorkflowBuilderSkeleton } from "./workflowBuilderSkeleton";
import { WorkflowBuilderWarnings } from "./workflowBuilderWarnings";
import { WorkflowCanvas } from "./workflowCanvas";
import { useWorkflowBuilderStore } from "@store/useWorkflowBuilderStore";

import { Button, Typography } from "@components/atoms";

interface WorkflowBuilderProps {
	projectId?: string;
	buildId?: string;
}

export const WorkflowBuilder = ({ projectId: propProjectId, buildId }: WorkflowBuilderProps) => {
	const { projectId: paramProjectId } = useParams<{ projectId: string }>();
	const projectId = propProjectId || paramProjectId;
	const { t } = useTranslation("workflowBuilder");
	const {
		clearWorkflow,
		nodes,
		edges,
		variables,
		getTriggerNodes,
		getCodeNodes,
		getConnectionNodes,
		isLoadingProject,
		loadError,
		loadProjectWorkflow,
		clearLoadError,
		warnings,
		hasUnsavedChanges,
	} = useWorkflowBuilderStore();

	useEffect(() => {
		if (projectId) {
			loadProjectWorkflow(projectId, buildId);
		}
	}, [projectId, buildId, loadProjectWorkflow]);

	const handleRetry = useCallback(() => {
		if (projectId) {
			loadProjectWorkflow(projectId, buildId);
		}
	}, [projectId, buildId, loadProjectWorkflow]);

	const triggerCount = getTriggerNodes().length;
	const codeCount = getCodeNodes().length;
	const connectionCount = getConnectionNodes().length;

	if (isLoadingProject) {
		return <WorkflowBuilderSkeleton />;
	}

	if (loadError) {
		return <WorkflowBuilderError error={loadError} onDismiss={clearLoadError} onRetry={handleRetry} />;
	}

	return (
		<ReactFlowProvider>
			<div className="flex size-full flex-col bg-gray-1100">
				<div className="flex items-center justify-between border-b border-gray-750 px-4 py-3">
					<div>
						<Typography className="text-white" variant="h2">
							{t("title")}
						</Typography>
						<Typography className="text-gray-400" element="p" size="small">
							{t("description")}
						</Typography>
					</div>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-3 text-sm">
							<div className="flex items-center gap-1.5">
								<span className="size-2 rounded-full bg-amber-500" />
								<span className="text-gray-400">
									{triggerCount} {triggerCount === 1 ? "trigger" : "triggers"}
								</span>
							</div>
							<div className="flex items-center gap-1.5">
								<span className="size-2 rounded-full bg-blue-500" />
								<span className="text-gray-400">
									{codeCount} {codeCount === 1 ? "file" : "files"}
								</span>
							</div>
							<div className="flex items-center gap-1.5">
								<span className="size-2 rounded-full bg-green-500" />
								<span className="text-gray-400">
									{connectionCount} {connectionCount === 1 ? "connection" : "connections"}
								</span>
							</div>
							{variables.length > 0 ? (
								<div className="flex items-center gap-1.5">
									<span className="size-2 rounded-full bg-gray-500" />
									<span className="text-gray-400">
										{variables.length} {variables.length === 1 ? "variable" : "variables"}
									</span>
								</div>
							) : null}
						</div>
						{hasUnsavedChanges ? (
							<div className="flex items-center gap-1.5">
								<span className="size-2 animate-pulse rounded-full bg-yellow-500" />
								<span className="text-yellow-500">{t("unsavedChanges")}</span>
							</div>
						) : null}
						<div className="h-6 w-px bg-gray-700" />
						<Typography className="text-gray-500" element="span" size="small">
							{t("stats", { nodes: nodes.length, edges: edges.length })}
						</Typography>
						{nodes.length > 0 || edges.length > 0 ? (
							<Button className="text-white" onClick={clearWorkflow} variant="outline">
								{t("clearCanvas")}
							</Button>
						) : null}
					</div>
				</div>
				<div className="relative flex flex-1 overflow-hidden">
					<WorkflowSidebar />
					<div className="relative flex-1 bg-gray-1000">
						<WorkflowBuilderWarnings warnings={warnings} />
						<WorkflowCanvas />
					</div>
				</div>
			</div>
			<ConnectionEditorModal />
			<DeleteEdgeModal />
			<DeleteNodeModal />
			<TriggerConfigModal />
			<ConnectionConfigModal />
		</ReactFlowProvider>
	);
};
