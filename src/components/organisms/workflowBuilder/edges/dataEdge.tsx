import React, { useCallback, useMemo, useState } from "react";

import { BaseEdge, EdgeLabelRenderer, getBezierPath, Position } from "@xyflow/react";
import { LuArrowLeftRight, LuBookOpen, LuPencil, LuX } from "react-icons/lu";

import { ModalName } from "@src/enums";
import { cn } from "@src/utilities";
import { useModalStore } from "@store/useModalStore";

interface DataOperation {
	operationType: "read" | "write";
	functionName: string;
	lineNumber?: number;
}

interface DataEdgeProps {
	id: string;
	sourceX: number;
	sourceY: number;
	targetX: number;
	targetY: number;
	sourcePosition: Position;
	targetPosition: Position;
	style?: React.CSSProperties;
	data?: {
		operations: DataOperation[];
		type: "data";
	};
}

export const DataEdge = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	data,
}: DataEdgeProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const { openModal } = useModalStore();

	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	const operations = data?.operations || [];
	const hasOperations = operations.length > 0;
	const readOps = operations.filter((op) => op.operationType === "read");
	const writeOps = operations.filter((op) => op.operationType === "write");

	const handleDeleteClick = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			openModal(ModalName.deleteWorkflowEdge, { edgeId: id });
		},
		[id, openModal]
	);

	const edgeStyle = useMemo(
		() => ({
			...style,
			stroke: hasOperations ? "#22c55e" : "#6b7280",
			strokeWidth: isHovered ? 3 : 2,
			strokeDasharray: hasOperations ? undefined : "5,5",
		}),
		[style, hasOperations, isHovered]
	);

	const labelContainerClass = useMemo(
		() =>
			cn(
				"flex flex-col items-center gap-1 rounded-lg border px-2 py-1.5 transition-all duration-200",
				hasOperations ? "border-green-500/50 bg-gray-900" : "border-gray-600 bg-gray-800",
				isHovered && "scale-105 shadow-lg"
			),
		[hasOperations, isHovered]
	);

	const deleteButtonClass = useMemo(
		() =>
			cn(
				"absolute -right-2 -top-2 flex size-4 cursor-pointer items-center justify-center rounded-full border border-red-500 bg-gray-900 transition-all duration-200",
				isHovered ? "scale-100 opacity-100" : "scale-0 opacity-0"
			),
		[isHovered]
	);

	return (
		<>
			<defs>
				<marker
					id={`data-arrow-start-${id}`}
					markerHeight="6"
					markerWidth="6"
					orient="auto-start-reverse"
					refX="0"
					refY="3"
				>
					<path d="M6,0 L6,6 L0,3 z" fill={hasOperations ? "#22c55e" : "#6b7280"} />
				</marker>
				<marker id={`data-arrow-end-${id}`} markerHeight="6" markerWidth="6" orient="auto" refX="6" refY="3">
					<path d="M0,0 L0,6 L6,3 z" fill={hasOperations ? "#22c55e" : "#6b7280"} />
				</marker>
			</defs>

			<BaseEdge
				id={id}
				markerEnd={`url(#data-arrow-end-${id})`}
				markerStart={`url(#data-arrow-start-${id})`}
				path={edgePath}
				style={edgeStyle}
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
					className="nodrag nopan pointer-events-auto absolute"
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					style={{
						transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
					}}
				>
					<div className="relative">
						<button className={deleteButtonClass} onClick={handleDeleteClick} type="button">
							<LuX className="size-2 text-red-500" />
						</button>

						<div
							className={labelContainerClass}
							onClick={() => setShowDetails(!showDetails)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									setShowDetails(!showDetails);
								}
							}}
							role="button"
							tabIndex={0}
						>
							<div className="flex items-center gap-1.5">
								<LuArrowLeftRight
									className={cn("size-3", hasOperations ? "text-green-400" : "text-gray-400")}
								/>
								<span
									className={cn(
										"text-10 font-medium",
										hasOperations ? "text-green-300" : "text-gray-400"
									)}
								>
									{hasOperations ? `${operations.length} ops` : "No operations"}
								</span>
							</div>

							{hasOperations ? (
								<div className="flex items-center gap-2">
									{readOps.length > 0 ? (
										<div className="flex items-center gap-0.5">
											<LuBookOpen className="size-2.5 text-blue-400" />
											<span className="text-10 text-blue-300">{readOps.length}</span>
										</div>
									) : null}
									{writeOps.length > 0 ? (
										<div className="flex items-center gap-0.5">
											<LuPencil className="size-2.5 text-orange-400" />
											<span className="text-10 text-orange-300">{writeOps.length}</span>
										</div>
									) : null}
								</div>
							) : null}
						</div>

						{showDetails && hasOperations ? (
							<div className="absolute left-1/2 top-full z-10 mt-1 w-48 -translate-x-1/2 rounded-lg border border-gray-700 bg-gray-900 p-2 shadow-xl">
								{readOps.length > 0 ? (
									<div className="mb-2">
										<div className="mb-1 flex items-center gap-1 text-10 font-medium text-blue-400">
											<LuBookOpen className="size-3" />
											Read Operations
										</div>
										{readOps.map((op, index) => (
											<div className="text-10 text-gray-300" key={`read-${index}`}>
												• {op.functionName}()
												{op.lineNumber ? (
													<span className="text-gray-500"> :L{op.lineNumber}</span>
												) : null}
											</div>
										))}
									</div>
								) : null}
								{writeOps.length > 0 ? (
									<div>
										<div className="mb-1 flex items-center gap-1 text-10 font-medium text-orange-400">
											<LuPencil className="size-3" />
											Write Operations
										</div>
										{writeOps.map((op, index) => (
											<div className="text-10 text-gray-300" key={`write-${index}`}>
												• {op.functionName}()
												{op.lineNumber ? (
													<span className="text-gray-500"> :L{op.lineNumber}</span>
												) : null}
											</div>
										))}
									</div>
								) : null}
							</div>
						) : null}
					</div>
				</div>
			</EdgeLabelRenderer>
		</>
	);
};
