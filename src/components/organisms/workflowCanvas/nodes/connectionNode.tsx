import React, { memo } from "react";

import { NodeProps, Node } from "@xyflow/react";

import { BaseNodeWrapper, NodeHeader, StatusIndicator, NodeContent } from "./baseNode";
import { ConnectionNodeData } from "@interfaces/store/workflowCanvasStore.interface";
import { cn } from "@utilities";

type ConnectionNodeType = Node<ConnectionNodeData, "connection">;

// ConnectionNode represents an external service integration on the workflow canvas.
// These are the "sources" of events in AutoKitteh - they connect to services like
// GitHub, Slack, Google Calendar, etc. and listen for events that can trigger
// your automation workflows.
//
// Visual structure:
// ┌─────────────────────────┐
// │  🔗 GitHub              │  <- Header with integration icon and name
// │     Connection Name     │  <- Subtitle showing the user's connection name
// ├─────────────────────────┤
// │  Status: Connected ●    │  <- Status section with indicator
// └─────────────────────────┘
//                          ○  <- Source handle (connections flow OUT to triggers)

export const ConnectionNode = memo(function ConnectionNode({
	data,
	selected,
	isConnectable,
}: NodeProps<ConnectionNodeType>) {
	// Destructure the connection data for easier access
	const { name, integrationUniqueName, status, statusMessage, logo: Logo } = data;

	// Map the status to a tooltip message that explains what action is needed
	const getStatusTooltip = (): string => {
		if (statusMessage) return statusMessage;

		switch (status) {
			case "ok":
				return "Connection is active and ready";
			case "warning":
				return "Connection has warnings - check configuration";
			case "error":
				return "Connection error - needs attention";
			case "init_required":
				return "Initial setup required - click to configure";
			default:
				return "Unknown status";
		}
	};

	return (
		<BaseNodeWrapper
			className="min-w-[200px]"
			isConnectable={isConnectable}
			nodeType="connection"
			// Connection nodes only have a source handle because they are
			// always the starting point of a workflow - events flow OUT from them
			selected={selected}
			showSourceHandle={true}
			showTargetHandle={false}
		>
			{/* Header section with integration icon and name */}
			<NodeHeader
				icon={Logo}
				iconClassName="fill-emerald-300"
				statusIndicator={<StatusIndicator status={status} tooltip={getStatusTooltip()} />}
				subtitle={integrationUniqueName || "Integration"}
				title={name}
			/>

			{/* Status message section - only shown if there's a message */}
			{statusMessage && status !== "ok" ? (
				<NodeContent className="pt-0">
					<p className={cn("truncate text-xs", status === "error" ? "text-red-300" : "text-amber-300")}>
						{statusMessage}
					</p>
				</NodeContent>
			) : null}

			{/* Integration type badge - helps identify what kind of service this is */}
			<NodeContent className="pb-3 pt-0">
				<div className="flex items-center gap-2">
					<span
						className={cn(
							"rounded-full px-2 py-0.5 text-xs font-medium",
							"bg-emerald-400/20 text-emerald-300"
						)}
					>
						{integrationUniqueName || "custom"}
					</span>
				</div>
			</NodeContent>
		</BaseNodeWrapper>
	);
});

export default ConnectionNode;
