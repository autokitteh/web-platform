import React, { memo, useCallback, useMemo, useState } from "react";

import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { LuCheck, LuX, LuZap } from "react-icons/lu";

import { ConnectionNodeData, ConnectionStatus } from "@interfaces/components/workflowBuilder.interface";
import { ModalName } from "@src/enums";
import { fitleredIntegrationsMap, Integrations } from "@src/enums/components";
import { cn } from "@src/utilities";
import { useModalStore } from "@store/useModalStore";
import { useWorkflowBuilderStore } from "@store/useWorkflowBuilderStore";

import { IconSvg, Typography } from "@components/atoms";

type ConnectionNodeProps = NodeProps<Node<ConnectionNodeData, "connection">>;

const statusConfig: Record<
	ConnectionStatus,
	{ bg: string; border: string; icon: React.ElementType | null; iconColor: string; pulse: boolean }
> = {
	disconnected: {
		border: "border-gray-600 border-dashed",
		bg: "bg-gray-900",
		icon: null,
		iconColor: "",
		pulse: false,
	},
	connected: {
		border: "border-green-500",
		bg: "bg-gray-900",
		icon: LuCheck,
		iconColor: "text-green-500",
		pulse: false,
	},
	active: {
		border: "border-blue-500",
		bg: "bg-gray-900",
		icon: LuZap,
		iconColor: "text-blue-500",
		pulse: true,
	},
	error: {
		border: "border-red-500",
		bg: "bg-gray-900",
		icon: LuX,
		iconColor: "text-red-500",
		pulse: false,
	},
};

const ConnectionNodeComponent = ({ id, data, selected }: ConnectionNodeProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const { openModal } = useModalStore();
	const { setSelectedNodeId } = useWorkflowBuilderStore();

	const integration = fitleredIntegrationsMap[data.integration as Integrations];
	const icon = integration?.icon;
	const statusStyle = statusConfig[data.status] || statusConfig.disconnected;
	const StatusIcon = statusStyle.icon;

	const handleDeleteClick = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			openModal(ModalName.deleteWorkflowNode, { nodeId: id, nodeName: data.connectionName });
		},
		[id, data.connectionName, openModal]
	);

	const handleNodeClick = useCallback(() => {
		setSelectedNodeId(id);
		openModal(ModalName.connectionConfig, { nodeId: id, connectionName: data.connectionName });
	}, [id, data.connectionName, setSelectedNodeId, openModal]);

	const handleExpandToggle = useCallback((event: React.MouseEvent) => {
		event.stopPropagation();
		setIsExpanded((prev) => !prev);
	}, []);

	const deleteButtonClass = useMemo(
		() =>
			cn(
				"absolute -right-1 -top-1 z-10 flex size-4 cursor-pointer items-center justify-center rounded-full border border-red-500 bg-gray-900 transition-all duration-200",
				isHovered ? "scale-100 opacity-100" : "scale-0 opacity-0"
			),
		[isHovered]
	);

	const containerClass = useMemo(
		() =>
			cn(
				"relative flex flex-col items-center transition-all duration-200",
				isExpanded ? "min-w-[180px]" : "w-[100px]"
			),
		[isExpanded]
	);

	const circleClass = useMemo(
		() =>
			cn(
				"relative flex size-16 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-200",
				statusStyle.border,
				statusStyle.bg,
				selected && "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-950",
				isHovered && "scale-105 shadow-lg",
				statusStyle.pulse && "animate-pulse"
			),
		[statusStyle.border, statusStyle.bg, statusStyle.pulse, selected, isHovered]
	);

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
			className={containerClass}
			onClick={handleNodeClick}
			onKeyDown={handleKeyDown}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			role="button"
			tabIndex={0}
		>
			<button className={deleteButtonClass} onClick={handleDeleteClick} type="button">
				<LuX className="size-2.5 text-red-500" />
			</button>

			<Handle
				className="!-top-1 !h-2.5 !w-2.5 !rounded-full !border-2 !border-gray-700 !bg-green-500"
				id="top"
				position={Position.Top}
				type="target"
			/>

			<div className={circleClass}>
				{icon ? (
					<div className="flex size-10 items-center justify-center rounded-full bg-white p-1">
						<IconSvg className="size-8" src={icon} />
					</div>
				) : (
					<Typography className="text-gray-400" element="span" size="small">
						{data.integration.slice(0, 2).toUpperCase()}
					</Typography>
				)}

				{StatusIcon ? (
					<div
						className={cn(
							"absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-gray-900 bg-gray-800"
						)}
					>
						<StatusIcon className={cn("size-3", statusStyle.iconColor)} />
					</div>
				) : null}
			</div>

			<Typography className="mt-2 text-center font-medium text-white" element="span" size="small">
				{data.connectionName}
			</Typography>
			<Typography className="text-center text-10 text-gray-500" element="span">
				{data.displayName}
			</Typography>

			{isExpanded && data.usedByFunctions.length > 0 ? (
				<div className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 p-2">
					<Typography className="mb-1 text-gray-400" element="span" size="small">
						Used by:
					</Typography>
					<div className="space-y-0.5">
						{data.usedByFunctions.slice(0, 4).map((fn) => (
							<Typography className="block text-gray-300" element="span" key={fn} size="small">
								• {fn}()
							</Typography>
						))}
						{data.usedByFunctions.length > 4 ? (
							<Typography className="text-gray-500" element="span" size="small">
								+{data.usedByFunctions.length - 4} more
							</Typography>
						) : null}
					</div>
				</div>
			) : null}

			{isHovered && data.usedByFunctions.length > 0 && !isExpanded ? (
				<button
					className="mt-1 rounded bg-gray-800 px-2 py-0.5 text-10 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
					onClick={handleExpandToggle}
					type="button"
				>
					Show details
				</button>
			) : null}

			<Handle
				className="!-bottom-1 !h-2.5 !w-2.5 !rounded-full !border-2 !border-gray-700 !bg-green-500"
				id="bottom"
				position={Position.Bottom}
				type="source"
			/>
			<Handle
				className="!-left-1 !h-2.5 !w-2.5 !rounded-full !border-2 !border-gray-700 !bg-green-500"
				id="left"
				position={Position.Left}
				type="target"
			/>
			<Handle
				className="!-right-1 !h-2.5 !w-2.5 !rounded-full !border-2 !border-gray-700 !bg-green-500"
				id="right"
				position={Position.Right}
				type="source"
			/>
		</div>
	);
};

export const ConnectionNode = memo(ConnectionNodeComponent);
