import React from "react";

import { useParams } from "react-router-dom";

import { WorkflowCanvas } from "./workflowCanvas";

// WorkflowCanvasPage is the full-page wrapper for the visual workflow builder.
// It handles route parameters and provides the appropriate layout structure
// to integrate with the existing AutoKitteh navigation and page system.
//
// This page is typically accessed via:
// /projects/:projectId/workflow
//
// It sits alongside the existing code editor view, giving users the choice
// between the traditional file-based editor and this visual canvas view.

export const WorkflowCanvasPage = () => {
	// Get the project ID from the URL parameters
	// This is passed to the WorkflowCanvas to load the correct project data
	const { projectId } = useParams<{ projectId: string }>();

	// If no project ID, show an error state
	if (!projectId) {
		return (
			<div className="flex h-full items-center justify-center bg-gray-950">
				<div className="text-center">
					<h2 className="mb-2 text-xl font-semibold text-white">No Project Selected</h2>
					<p className="text-gray-400">Please select a project to view its workflow.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex size-full flex-col bg-gray-950">
			{/* Page header - provides context and potentially view toggle buttons */}
			<div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/50 px-6 py-3">
				<div>
					<p className="mt-0.5 text-sm text-gray-500">
						Visual workflow editor · Drag and drop to design your automations
					</p>
				</div>

				{/* Future: Add view toggle buttons here (Code/Visual) */}
				{/* Future: Add help/documentation link */}
			</div>

			{/* Main canvas area - takes up remaining height */}
			<div className="flex-1 overflow-hidden">
				<WorkflowCanvas className="h-full" projectId={projectId} />
			</div>
		</div>
	);
};

export default WorkflowCanvasPage;
