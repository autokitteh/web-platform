import React, { memo } from "react";

import { Handle, Position } from "@xyflow/react";

import { cn } from "@utilities";

import { IconSvg } from "@components/atoms";

// Base node wrapper that provides consistent styling across all node types.
// This component handles the common visual elements like selection states,
// hover effects, and handle positioning that all workflow nodes share.
export interface BaseNodeWrapperProps {
	children: React.ReactNode;
	selected?: boolean;
	className?: string;
	isConnectable?: boolean;
	showSourceHandle?: boolean;
	showTargetHandle?: boolean;
	sourceHandlePosition?: Position;
	targetHandlePosition?: Position;
	nodeType: "connection" | "file" | "trigger" | "variable";
}

// Color schemes for different node types - creates visual distinction
// between connections, files, triggers, and variables on the canvas.
const nodeTypeColors = {
	connection: {
		bg: "bg-gradient-to-br from-emerald-900/90 to-emerald-950/95",
		border: "border-emerald-500/40",
		selectedBorder: "border-emerald-400",
		glow: "shadow-emerald-500/20",
		handle: "bg-emerald-400",
	},
	file: {
		bg: "bg-gradient-to-br from-blue-900/90 to-blue-950/95",
		border: "border-blue-500/40",
		selectedBorder: "border-blue-400",
		glow: "shadow-blue-500/20",
		handle: "bg-blue-400",
	},
	trigger: {
		bg: "bg-gradient-to-br from-amber-900/90 to-amber-950/95",
		border: "border-amber-500/40",
		selectedBorder: "border-amber-400",
		glow: "shadow-amber-500/20",
		handle: "bg-amber-400",
	},
	variable: {
		bg: "bg-gradient-to-br from-purple-900/90 to-purple-950/95",
		border: "border-purple-500/40",
		selectedBorder: "border-purple-400",
		glow: "shadow-purple-500/20",
		handle: "bg-purple-400",
	},
};

export const BaseNodeWrapper = memo(function BaseNodeWrapper({
	children,
	selected,
	className,
	isConnectable = true,
	showSourceHandle = true,
	showTargetHandle = true,
	sourceHandlePosition = Position.Right,
	targetHandlePosition = Position.Left,
	nodeType,
}: BaseNodeWrapperProps) {
	const colors = nodeTypeColors[nodeType];

	return (
		<div
			className={cn(
				// Base container styles - rounded corners and backdrop blur for depth
				"relative rounded-xl backdrop-blur-sm transition-all duration-200",
				// Gradient background based on node type
				colors.bg,
				// Border styling - thicker and brighter when selected
				"border-2",
				selected ? colors.selectedBorder : colors.border,
				// Shadow effects - subtle glow that intensifies on hover/selection
				"shadow-lg",
				selected && `shadow-xl ${colors.glow}`,
				// Hover state - slight lift and brighter border
				"hover:scale-[1.02] hover:shadow-xl",
				className
			)}
		>
			{/* Target handle - where incoming connections attach.
			    Positioned on the left by default for left-to-right workflow flow. */}
			{showTargetHandle ? (
				<Handle
					className={cn(
						"!h-3 !w-3 rounded-full !border-2 !border-gray-900 transition-transform",
						colors.handle,
						// Scale up the handle on hover for easier targeting
						"hover:scale-125"
					)}
					isConnectable={isConnectable}
					position={targetHandlePosition}
					type="target"
				/>
			) : null}

			{/* Main node content area */}
			{children}

			{/* Source handle - where outgoing connections start.
			    Positioned on the right by default for left-to-right flow. */}
			{showSourceHandle ? (
				<Handle
					className={cn(
						"!h-3 !w-3 rounded-full !border-2 !border-gray-900 transition-transform",
						colors.handle,
						"hover:scale-125"
					)}
					isConnectable={isConnectable}
					position={sourceHandlePosition}
					type="source"
				/>
			) : null}
		</div>
	);
});

// Node header component - provides a consistent title area with optional icon.
// Used at the top of each node to show the node name and type indicator.
export interface NodeHeaderProps {
	title: string;
	subtitle?: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	iconClassName?: string;
	statusIndicator?: React.ReactNode;
}

export const NodeHeader = memo(function NodeHeader({
	title,
	subtitle,
	icon,
	iconClassName,
	statusIndicator,
}: NodeHeaderProps) {
	return (
		<div className="flex items-center gap-3 px-4 py-3">
			{/* Icon container - shows the integration or file type icon */}
			{icon ? (
				<div className="shrink-0">
					<IconSvg className={cn("size-6", iconClassName)} src={icon} />
				</div>
			) : null}

			{/* Text content - title with optional subtitle below */}
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<span className="truncate text-sm font-semibold text-white">{title}</span>
					{statusIndicator}
				</div>
				{subtitle ? <span className="truncate text-xs text-gray-400">{subtitle}</span> : null}
			</div>
		</div>
	);
});

// Status indicator dot - shows connection status or validation state.
// Uses color coding: green for OK, yellow for warning, red for error.
export interface StatusIndicatorProps {
	status: "ok" | "warning" | "error" | "init_required" | "pending";
	tooltip?: string;
}

export const StatusIndicator = memo(function StatusIndicator({ status, tooltip }: StatusIndicatorProps) {
	const statusColors = {
		ok: "bg-green-400",
		warning: "bg-yellow-400",
		error: "bg-red-400",
		init_required: "bg-orange-400",
		pending: "bg-gray-400",
	};

	const statusLabels = {
		ok: "Connected",
		warning: "Warning",
		error: "Error",
		init_required: "Setup Required",
		pending: "Pending",
	};

	return (
		<div
			className={cn(
				"size-2 shrink-0 rounded-full",
				statusColors[status],
				// Pulse animation for states that need attention
				(status === "init_required" || status === "error") && "animate-pulse"
			)}
			title={tooltip || statusLabels[status]}
		/>
	);
});

// Divider line for separating sections within a node.
// Uses subtle transparency to avoid being too prominent.
export const NodeDivider = memo(function NodeDivider() {
	return <div className="mx-3 border-t border-white/10" />;
});

// Content section wrapper - provides consistent padding for node content areas.
export interface NodeContentProps {
	children: React.ReactNode;
	className?: string;
}

export const NodeContent = memo(function NodeContent({ children, className }: NodeContentProps) {
	return <div className={cn("px-4 py-2 text-sm text-gray-300", className)}>{children}</div>;
});

// Function list item - displays a single function/method within a file node.
// Used to show available entry points that triggers can connect to.
export interface FunctionItemProps {
	name: string;
	isEntrypoint?: boolean;
	onClick?: () => void;
}

export const FunctionItem = memo(function FunctionItem({ name, isEntrypoint, onClick }: FunctionItemProps) {
	return (
		<button
			className={cn(
				"w-full rounded-md px-3 py-1.5 text-left text-xs",
				"transition-colors duration-150",
				"hover:bg-white/10",
				isEntrypoint ? "font-medium text-blue-300" : "text-gray-400"
			)}
			onClick={onClick}
			type="button"
		>
			<span className="font-mono">
				{name}
				<span className="text-gray-500">()</span>
			</span>
		</button>
	);
});
