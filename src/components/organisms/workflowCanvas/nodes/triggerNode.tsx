import React, { memo } from "react";

import { NodeProps, Node } from "@xyflow/react";

import { BaseNodeWrapper, NodeHeader, NodeDivider, NodeContent } from "./baseNode";
import { TriggerNodeData } from "@interfaces/store/workflowCanvasStore.interface";
import { cn } from "@utilities";

// Icons for different trigger types
import { WebhookIcon, ScheduleIcon, ConnectionIcon, TriggerIcon } from "@assets/image/icons";

type TriggerNodeType = Node<TriggerNodeData, "trigger">;

// TriggerNode is the "bridge" between connections and code in the workflow canvas.
// Triggers define the rules for WHEN your code should run. They can be activated by:
//
// 1. Connection events - Something happens in a connected service (e.g., "when a
//    GitHub pull request is opened")
// 2. Schedules - Run at specific times or intervals (e.g., "every Monday at 9am")
// 3. Webhooks - External HTTP calls trigger execution (e.g., API endpoints)
//
// The visual design emphasizes the "flow" nature of triggers - they have handles
// on both sides because they receive events from connections (left) and route
// them to specific functions in files (right).
//
// Visual structure:
// ┌─────────────────────────┐
// │  ⚡ PR Review Trigger    │  <- Header with trigger icon and name
// │     Connection Event     │  <- Type indicator
// ├─────────────────────────┤
// │  Event: pull_request    │  <- What event type activates this
// │  Target: on_pr_opened   │  <- Which function receives the event
// └─────────────────────────┘
//  ○                       ○  <- Both handles (receives from connection, sends to file)

// Map trigger types to their visual configuration
const triggerTypeConfig: Record<
	TriggerNodeData["triggerType"],
	{
		bgColor: string;
		color: string;
		icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
		label: string;
	}
> = {
	connection: {
		icon: ConnectionIcon || TriggerIcon,
		color: "text-amber-400",
		label: "Connection Event",
		bgColor: "bg-amber-400/20",
	},
	schedule: {
		icon: ScheduleIcon || TriggerIcon,
		color: "text-cyan-400",
		label: "Scheduled",
		bgColor: "bg-cyan-400/20",
	},
	webhook: {
		icon: WebhookIcon || TriggerIcon,
		color: "text-pink-400",
		label: "Webhook",
		bgColor: "bg-pink-400/20",
	},
};

export const TriggerNode = memo(function TriggerNode({ data, selected, isConnectable }: NodeProps<TriggerNodeType>) {
	// Destructure trigger data for rendering
	const { name, triggerType, eventType, functionName, filePath, schedule, webhookSlug, filter } = data;

	// Get visual configuration for this trigger type
	const typeConfig = triggerTypeConfig[triggerType] || triggerTypeConfig.connection;
	const TypeIcon = typeConfig.icon;

	// Format the schedule for display if it's a cron-based trigger
	const formatSchedule = (schedule: string): string => {
		// Basic cron interpretation - you could make this more sophisticated
		if (schedule.includes("@hourly")) return "Every hour";
		if (schedule.includes("@daily")) return "Daily";
		if (schedule.includes("@weekly")) return "Weekly";
		if (schedule.includes("@monthly")) return "Monthly";
		return schedule; // Show raw cron if we can't interpret it
	};

	// Determine what to show as the "source" info
	const getSourceInfo = (): { label: string; value: string } | null => {
		switch (triggerType) {
			case "connection":
				return eventType ? { label: "Event", value: eventType } : null;
			case "schedule":
				return schedule ? { label: "Schedule", value: formatSchedule(schedule) } : null;
			case "webhook":
				return webhookSlug ? { label: "Webhook", value: `/${webhookSlug}` } : null;
			default:
				return null;
		}
	};

	const sourceInfo = getSourceInfo();

	return (
		<BaseNodeWrapper
			className="min-w-[180px]"
			isConnectable={isConnectable}
			selected={selected}
			showSourceHandle={true}
			nodeType="trigger"
			// Triggers have handles on both sides - they're the connectors in the flow
			showTargetHandle={true}
		>
			{/* Header with trigger name and type icon */}
			<NodeHeader
				icon={TypeIcon}
				iconClassName={typeConfig.color}
				subtitle={typeConfig.label}
				title={name || "Unnamed Trigger"}
			/>

			{/* Trigger type badge */}
			<NodeContent className="pb-2 pt-0">
				<span
					className={cn(
						"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
						typeConfig.bgColor,
						typeConfig.color.replace("text-", "text-")
					)}
				>
					{typeConfig.label}
				</span>
			</NodeContent>

			{/* Details section - shows what activates this trigger */}
			{sourceInfo || functionName || filter ? (
				<>
					<NodeDivider />
					<NodeContent className="space-y-1.5">
						{/* Source info - event type, schedule, or webhook */}
						{sourceInfo ? (
							<div className="flex items-center justify-between gap-2">
								<span className="text-xs text-gray-500">{sourceInfo.label}:</span>
								<span className="max-w-[120px] truncate font-mono text-xs text-gray-300">
									{sourceInfo.value}
								</span>
							</div>
						) : null}

						{/* Target function - where the trigger routes events */}
						{functionName ? (
							<div className="flex items-center justify-between gap-2">
								<span className="text-xs text-gray-500">Target:</span>
								<span className="max-w-[120px] truncate font-mono text-xs text-amber-300">
									{functionName}()
								</span>
							</div>
						) : null}

						{/* Filter expression - conditions that must be met */}
						{filter ? (
							<div className="flex items-center justify-between gap-2">
								<span className="text-xs text-gray-500">Filter:</span>
								<span className="max-w-[100px] truncate font-mono text-xs text-gray-400" title={filter}>
									{filter}
								</span>
							</div>
						) : null}
					</NodeContent>
				</>
			) : null}

			{/* Entry point indicator - shows the full path:function format */}
			{filePath && functionName ? (
				<NodeContent className="pb-3 pt-0">
					<div className="flex items-center gap-1 text-xs text-gray-500">
						<span className="max-w-[150px] truncate" title={`${filePath}:${functionName}`}>
							→ {filePath.split("/").pop()}:{functionName}
						</span>
					</div>
				</NodeContent>
			) : null}
		</BaseNodeWrapper>
	);
});

export default TriggerNode;
