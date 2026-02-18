import React, { useCallback, useMemo, useState } from "react";

import { BaseEdge, EdgeLabelRenderer, getBezierPath, Position } from "@xyflow/react";
import { LuCode, LuVariable, LuX, LuZap } from "react-icons/lu";

import { ModalName } from "@enums/components";
import { EdgeStatus, WorkflowEdgeVariable } from "@interfaces/components/workflowBuilder.interface";
import { cn } from "@src/utilities";
import { useModalStore } from "@store/useModalStore";

interface CodeEdgeProps {
	id: string;
	sourceX: number;
	sourceY: number;
	targetX: number;
	targetY: number;
	sourcePosition: Position;
	targetPosition: Position;
	style?: React.CSSProperties;
	markerEnd?: string;
	data?: {
		code?: string;
		eventType?: string;
		status?: EdgeStatus;
		variables?: WorkflowEdgeVariable[];
	};
}

const statusColors: Record<EdgeStatus, { bg: string; border: string; stroke: string; text: string }> = {
	draft: { stroke: "#6b7280", bg: "bg-gray-700", border: "border-gray-500", text: "text-gray-400" },
	configured: { stroke: "#22c55e", bg: "bg-gray-900", border: "border-green-500", text: "text-green-400" },
	active: { stroke: "#3b82f6", bg: "bg-blue-900", border: "border-blue-500", text: "text-blue-400" },
	error: { stroke: "#ef4444", bg: "bg-red-900", border: "border-red-500", text: "text-red-400" },
};

export const CodeEdge = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	markerEnd,
	data,
}: CodeEdgeProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const { openModal } = useModalStore();

	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	const status: EdgeStatus = data?.status || "draft";
	const hasCode = data?.code && data.code.trim().length > 0;
	const hasEventType = data?.eventType && data?.eventType.trim().length > 0;
	const varsCount = data?.variables?.length || 0;
	const colors = statusColors[status];

	const handleDeleteClick = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			openModal(ModalName.deleteWorkflowEdge, { edgeId: id });
		},
		[id, openModal]
	);

	const deleteButtonClass = useMemo(
		() =>
			cn(
				"flex size-5 cursor-pointer items-center justify-center rounded-full border border-red-500 bg-gray-900 transition-all duration-200",
				isHovered ? "scale-100 opacity-100" : "scale-0 opacity-0"
			),
		[isHovered]
	);

	const edgeLabelContainerClass = useMemo(
		() =>
			cn(
				"flex min-w-24 flex-col items-center gap-1 rounded-lg border px-2 py-1.5 transition-all duration-200",
				colors.bg,
				colors.border,
				isHovered ? "scale-105 shadow-lg" : "scale-100"
			),
		[colors.bg, colors.border, isHovered]
	);

	const edgeStyle = useMemo(
		() => ({
			...style,
			stroke: colors.stroke,
			strokeWidth: isHovered ? 3 : 2,
			strokeDasharray: status === "draft" ? "5,5" : undefined,
		}),
		[style, colors.stroke, isHovered, status]
	);

	return (
		<>
			<BaseEdge id={id} markerEnd={markerEnd} path={edgePath} style={edgeStyle} />
			<path
				className="react-flow__edge-interaction"
				d={edgePath}
				fill="none"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				stroke="transparent"
				strokeWidth={20}
				style={{ cursor: "pointer" }}
			/>
			<EdgeLabelRenderer>
				<div
					className="nodrag nopan pointer-events-auto absolute flex flex-col items-center gap-1"
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					style={{
						transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
					}}
				>
					<button className={deleteButtonClass} onClick={handleDeleteClick} type="button">
						<LuX className="size-2.5 text-red-500" />
					</button>

					<div className={edgeLabelContainerClass}>
						{hasEventType ? (
							<div className="flex items-center gap-1">
								<LuZap className={cn("size-3", colors.text)} />
								<span className={cn("text-10 font-medium", colors.text)}>{data?.eventType}</span>
							</div>
						) : (
							<span className="text-10 text-gray-500">No event</span>
						)}

						<div className="flex items-center gap-2">
							<div className="flex items-center gap-0.5">
								<LuCode className={cn("size-3", hasCode ? colors.text : "text-gray-500")} />
								{hasCode ? (
									<span className={cn("text-10", colors.text)}>Code</span>
								) : (
									<span className="text-10 text-gray-500">No code</span>
								)}
							</div>

							{varsCount > 0 ? (
								<div className="flex items-center gap-0.5">
									<LuVariable className={cn("size-3", colors.text)} />
									<span className={cn("text-10", colors.text)}>{varsCount}</span>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</EdgeLabelRenderer>
		</>
	);
};
