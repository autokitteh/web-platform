import React from "react";

import { ReactFlowProvider } from "@xyflow/react";
import { useTranslation } from "react-i18next";

import { ConnectionEditorModal } from "./connectionEditorModal";
import { DeleteEdgeModal } from "./deleteEdgeModal";
import { DeleteNodeModal } from "./deleteNodeModal";
import { IntegrationsSidebar } from "./integrationsSidebar";
import { WorkflowCanvas } from "./workflowCanvas";
import { useWorkflowBuilderStore } from "@store/useWorkflowBuilderStore";

import { Button, Typography } from "@components/atoms";

export const WorkflowBuilder = () => {
	const { t } = useTranslation("workflowBuilder");
	const { clearWorkflow, nodes, edges } = useWorkflowBuilderStore();

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
					<div className="flex items-center gap-3">
						<Typography className="text-gray-400" element="span" size="small">
							{t("stats", { nodes: nodes.length, edges: edges.length })}
						</Typography>
						{nodes.length > 0 || edges.length > 0 ? (
							<Button className="text-white" onClick={clearWorkflow} variant="outline">
								{t("clearCanvas")}
							</Button>
						) : null}
					</div>
				</div>
				<div className="flex flex-1 overflow-hidden">
					<IntegrationsSidebar />
					<div className="flex-1 bg-gray-1000">
						<WorkflowCanvas />
					</div>
				</div>
			</div>
			<ConnectionEditorModal />
			<DeleteEdgeModal />
			<DeleteNodeModal />
		</ReactFlowProvider>
	);
};
