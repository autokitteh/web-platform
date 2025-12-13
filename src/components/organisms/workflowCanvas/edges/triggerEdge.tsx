import React, { memo } from "react";

import { BaseEdge, Edge, EdgeLabelRenderer, EdgeProps, getBezierPath } from "@xyflow/react";

import { cn } from "@utilities";

// TriggerEdge is a custom edge component that visualizes the flow of events
// between nodes in the workflow canvas. Unlike the default edges, our trigger
// edges have special styling to emphasize the "event flow" nature of the
// connections and can display labels (like function names) along the path.
//
// Visual characteristics:
// - Animated gradient stroke that pulses along the connection
// - Label positioned at the midpoint showing what's being triggered
// - Different colors based on connection type
// - Hover state with increased opacity

export interface TriggerEdgeData extends Record<string, unknown> {
	label?: string;
	triggerType?: "connection" | "schedule" | "webhook";
	animated?: boolean;
}

type TriggerEdgeType = Edge<TriggerEdgeData, "trigger">;

export const TriggerEdge = memo(function TriggerEdge({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style,
	data,
	selected,
	markerEnd,
}: EdgeProps<TriggerEdgeType>) {
	// Calculate the bezier path for the edge
	// This creates a smooth curved line between the source and target nodes
	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	// Determine edge color based on trigger type
	const getEdgeColor = (): string => {
		const triggerType = data?.triggerType || "connection";
		switch (triggerType) {
			case "connection":
				return "#f59e0b"; // Amber for connection events
			case "schedule":
				return "#06b6d4"; // Cyan for scheduled triggers
			case "webhook":
				return "#ec4899"; // Pink for webhooks
			default:
				return "#6b7280"; // Gray default
		}
	};

	const edgeColor = getEdgeColor();
	const label = data?.label;

	return (
		<>
			{/* SVG gradient definition for the animated effect */}
			<defs>
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id={`edge-gradient-${id}`}
					x1={sourceX}
					x2={targetX}
					y1={sourceY}
					y2={targetY}
				>
					<stop offset="0%" stopColor={edgeColor} stopOpacity={0.2} />
					<stop offset="50%" stopColor={edgeColor} stopOpacity={0.8} />
					<stop offset="100%" stopColor={edgeColor} stopOpacity={0.2} />
				</linearGradient>
			</defs>

			{/* Background path - provides a subtle glow effect */}
			<path
				className="transition-all duration-200"
				d={edgePath}
				fill="none"
				stroke={edgeColor}
				strokeOpacity={0.1}
				strokeWidth={8}
			/>

			{/* Main edge path with gradient stroke */}
			<BaseEdge
				id={id as string}
				markerEnd={markerEnd}
				path={edgePath}
				style={{
					...(style || {}),
					stroke: `url(#edge-gradient-${id})`,
					strokeWidth: selected ? 3 : 2,
					transition: "stroke-width 0.2s ease",
				}}
			/>

			{/* Animated dash pattern that flows along the edge */}
			<path
				className={cn("transition-opacity duration-200", selected ? "opacity-100" : "opacity-50")}
				d={edgePath}
				fill="none"
				stroke={edgeColor}
				strokeDasharray="5 5"
				strokeWidth={2}
				style={{
					animation: "dash 1s linear infinite",
				}}
			/>

			{/* Label renderer - displays the function name or other label at the midpoint */}
			{label ? (
				<EdgeLabelRenderer>
					<div
						className={cn(
							"rounded-md px-2 py-1 font-mono text-xs",
							"border bg-gray-900/90 backdrop-blur-sm",
							"transition-all duration-200",
							selected
								? "border-amber-400/60 text-amber-300 shadow-lg shadow-amber-500/20"
								: "border-gray-700/50 text-gray-400"
						)}
						style={{
							position: "absolute",
							transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
							pointerEvents: "all",
						}}
					>
						{label}()
					</div>
				</EdgeLabelRenderer>
			) : null}

			{/* CSS for the flowing animation */}
			<style>
				{`
					@keyframes dash {
						to {
							stroke-dashoffset: -10;
						}
					}
				`}
			</style>
		</>
	);
});

export default TriggerEdge;
