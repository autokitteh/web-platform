import React, { useMemo, useState } from "react";

import { BaseEdge, EdgeLabelRenderer, getBezierPath, Position } from "@xyflow/react";
import { LuPlay } from "react-icons/lu";

import { cn } from "@src/utilities";

interface ExecutionEdgeProps {
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
		functionCall: string;
		isActive: boolean;
		type: "execution";
	};
}

export const ExecutionEdge = ({
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
}: ExecutionEdgeProps) => {
	const [isHovered, setIsHovered] = useState(false);

	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	const isActive = data?.isActive ?? false;
	const functionCall = data?.functionCall || "undefined";

	const edgeStyle = useMemo(
		() => ({
			...style,
			stroke: isActive ? "#f59e0b" : "#6b7280",
			strokeWidth: isHovered ? 4 : 3,
			filter: isActive ? "drop-shadow(0 0 6px rgba(245, 158, 11, 0.5))" : undefined,
		}),
		[style, isActive, isHovered]
	);

	const labelContainerClass = useMemo(
		() =>
			cn(
				"flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-all duration-200",
				isActive
					? "border-amber-500/50 bg-amber-900/40 shadow-lg shadow-amber-500/20"
					: "border-gray-600 bg-gray-800",
				isHovered && "scale-105"
			),
		[isActive, isHovered]
	);

	return (
		<>
			<defs>
				<linearGradient id={`execution-gradient-${id}`} x1="0%" x2="100%" y1="0%" y2="0%">
					<stop offset="0%" stopColor="#f59e0b" />
					<stop offset="100%" stopColor="#3b82f6" />
				</linearGradient>
			</defs>

			<BaseEdge
				id={id}
				markerEnd={markerEnd}
				path={edgePath}
				style={{
					...edgeStyle,
					stroke: isActive ? `url(#execution-gradient-${id})` : edgeStyle.stroke,
				}}
			/>

			{isActive ? (
				<circle fill="#f59e0b" r="4">
					<animateMotion dur="2s" path={edgePath} repeatCount="indefinite" />
				</circle>
			) : null}

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
					className="nodrag nopan pointer-events-auto absolute"
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					style={{
						transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
					}}
				>
					<div className={labelContainerClass}>
						<LuPlay className={cn("size-3", isActive ? "text-amber-400" : "text-gray-400")} />
						<span className={cn("text-xs font-medium", isActive ? "text-amber-300" : "text-gray-300")}>
							{functionCall}()
						</span>
					</div>
				</div>
			</EdgeLabelRenderer>
		</>
	);
};
