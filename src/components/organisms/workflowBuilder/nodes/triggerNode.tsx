import React, { memo, useCallback, useMemo, useState } from "react";

import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { LuClock, LuLink, LuX, LuZap } from "react-icons/lu";

import { TriggerNodeData, TriggerType } from "@interfaces/components/workflowBuilder.interface";
import { ModalName } from "@src/enums";
import { cn } from "@src/utilities";
import { useModalStore } from "@store/useModalStore";
import { useWorkflowBuilderStore } from "@store/useWorkflowBuilderStore";

import { Typography } from "@components/atoms";

type TriggerNodeProps = NodeProps<Node<TriggerNodeData, "trigger">>;

const triggerConfig: Record<TriggerType, { bgColor: string; color: string; icon: React.ElementType; label: string }> = {
	schedule: {
		icon: LuClock,
		color: "text-amber-400",
		bgColor: "bg-amber-500/20",
		label: "Schedule",
	},
	webhook: {
		icon: LuLink,
		color: "text-purple-400",
		bgColor: "bg-purple-500/20",
		label: "Webhook",
	},
	event: {
		icon: LuZap,
		color: "text-blue-400",
		bgColor: "bg-blue-500/20",
		label: "Event",
	},
};

const statusColors: Record<string, { border: string; shadow: string }> = {
	draft: { border: "border-gray-500", shadow: "" },
	configured: { border: "border-green-500", shadow: "shadow-green-500/20" },
	active: { border: "border-blue-500", shadow: "shadow-blue-500/30" },
	error: { border: "border-red-500", shadow: "shadow-red-500/20" },
};

const TriggerNodeComponent = ({ id, data, selected }: TriggerNodeProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const { openModal } = useModalStore();
	const { setSelectedNodeId } = useWorkflowBuilderStore();

	const config = triggerConfig[data.type];
	const Icon = config.icon;
	const status = statusColors[data.status] || statusColors.draft;

	const handleDeleteClick = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			openModal(ModalName.deleteWorkflowNode, { nodeId: id, nodeName: data.name });
		},
		[id, data.name, openModal]
	);

	const handleNodeClick = useCallback(() => {
		setSelectedNodeId(id);
		openModal(ModalName.triggerConfig, { nodeId: id });
	}, [id, setSelectedNodeId, openModal]);

	const deleteButtonClass = useMemo(
		() =>
			cn(
				"absolute -right-2 -top-2 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full border border-red-500 bg-gray-900 transition-all duration-200",
				isHovered ? "scale-100 opacity-100" : "scale-0 opacity-0"
			),
		[isHovered]
	);

	const displayValue = useMemo(() => {
		if (data.type === "schedule" && data.schedule) {
			return data.schedule;
		}
		if (data.type === "webhook" && data.httpMethod) {
			return data.httpMethod;
		}
		if (data.type === "event" && data.eventType) {
			return data.eventType;
		}
		return "Configure...";
	}, [data]);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				handleNodeClick();
			}
		},
		[handleNodeClick]
	);

	return (
		<div
			className="relative cursor-pointer"
			onClick={handleNodeClick}
			onKeyDown={handleKeyDown}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			role="button"
			tabIndex={0}
		>
			<button className={deleteButtonClass} onClick={handleDeleteClick} type="button">
				<LuX className="size-3 text-red-500" />
			</button>

			<svg className="absolute -z-10" height="140" viewBox="0 0 120 140" width="120">
				<polygon
					className={cn(
						"transition-all duration-200",
						selected ? "fill-gray-800" : "fill-gray-900",
						isHovered && "fill-gray-800"
					)}
					points="60,0 115,35 115,105 60,140 5,105 5,35"
					stroke={selected ? "#3b82f6" : isHovered ? "#6b7280" : "#374151"}
					strokeWidth="2"
				/>
			</svg>

			<div className="flex h-[140px] w-[120px] flex-col items-center justify-center px-3">
				<div
					className={cn(
						"mb-2 flex size-10 items-center justify-center rounded-full",
						config.bgColor,
						status.border,
						status.shadow && `shadow-lg ${status.shadow}`
					)}
				>
					<Icon className={cn("size-5", config.color)} />
				</div>

				<Typography className="text-center text-white" element="span" size="small">
					{data.name || config.label}
				</Typography>

				<Typography className={cn("mt-1 text-center text-10", config.color)} element="span">
					{displayValue}
				</Typography>

				{data.call ? (
					<Typography className="mt-1 truncate text-center text-10 text-gray-500" element="span">
						→ {data.call.split(":")[1] || data.call}
					</Typography>
				) : null}
			</div>

			<Handle
				className="!bottom-0 !h-3 !w-3 !rounded-full !border-2 !border-gray-700 !bg-amber-500"
				id="bottom"
				position={Position.Bottom}
				type="source"
			/>
		</div>
	);
};

export const TriggerNode = memo(TriggerNodeComponent);
