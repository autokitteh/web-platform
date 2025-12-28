import React, { useCallback, useMemo, useState } from "react";

import { BaseEdge, EdgeLabelRenderer, getBezierPath, Position } from "@xyflow/react";
import { LuCode, LuX } from "react-icons/lu";

import { ModalName } from "@enums/components";
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
	data?: { code?: string; eventType?: string };
}

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

	const hasCode = data?.code && data.code.trim().length > 0;

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

	const codeIconContainerClass = useMemo(
		() =>
			cn(
				"flex size-8 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-200",
				isHovered || hasCode
					? "scale-100 border-green-500 bg-gray-900 opacity-100"
					: "scale-75 border-gray-600 bg-gray-900 opacity-0"
			),
		[isHovered, hasCode]
	);

	const codeIconClass = useMemo(() => cn("size-4", hasCode ? "text-green-500" : "text-gray-400"), [hasCode]);

	return (
		<>
			<BaseEdge
				id={id}
				markerEnd={markerEnd}
				path={edgePath}
				style={{
					...style,
					strokeWidth: isHovered ? 3 : 2,
				}}
			/>
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
						transform: `translate(-50%, calc(-50% - 12px)) translate(${labelX}px, ${labelY}px)`,
					}}
				>
					<button className={deleteButtonClass} onClick={handleDeleteClick} type="button">
						<LuX className="size-2.5 text-red-500" />
					</button>
					<div className={codeIconContainerClass}>
						<LuCode className={codeIconClass} />
					</div>
				</div>
			</EdgeLabelRenderer>
		</>
	);
};
