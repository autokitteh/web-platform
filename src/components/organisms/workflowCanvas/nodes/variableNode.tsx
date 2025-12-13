import React, { memo } from "react";

import { NodeProps, Node } from "@xyflow/react";

import { BaseNodeWrapper, NodeHeader, NodeContent } from "./baseNode";
import { VariableNodeData } from "@interfaces/store/workflowCanvasStore.interface";
import { cn } from "@utilities";

// Icons
import { VariableIcon, LockIcon } from "@assets/image/icons";

type VariableNodeType = Node<VariableNodeData, "variable">;

// VariableNode represents environment variables and configuration values in the
// workflow canvas. While variables don't have "connections" in the traditional
// flow sense (they're accessed by name in code), displaying them on the canvas
// helps users see the complete picture of their project configuration.
//
// The node distinguishes between:
// - Regular variables: Display the actual value (truncated if long)
// - Secret variables: Show a masked value for security
//
// Visual structure:
// ┌─────────────────────────┐
// │  📋 API_KEY            │  <- Header with variable name
// │     Environment Var     │
// ├─────────────────────────┤
// │  Value: ••••••••       │  <- Masked if secret, visible if not
// └─────────────────────────┘
//
// Note: Variable nodes don't have connection handles by default since they
// don't participate in the event flow - they're accessed directly by name.

export const VariableNode = memo(function VariableNode({ data, selected, isConnectable }: NodeProps<VariableNodeType>) {
	const { name, value, isSecret } = data;

	// Format the value for display - mask secrets, truncate long values
	const displayValue = (): string => {
		if (isSecret) {
			return "••••••••••";
		}
		if (!value) {
			return "(not set)";
		}
		if (value.length > 20) {
			return `${value.substring(0, 17)}...`;
		}
		return value;
	};

	// Choose icon based on whether this is a secret
	const Icon = isSecret ? LockIcon || VariableIcon : VariableIcon;

	return (
		<BaseNodeWrapper
			className="min-w-160"
			isConnectable={isConnectable}
			nodeType="variable"
			// Variables don't connect to other nodes in the flow sense
			// They're accessed by name in the code, not through connections
			selected={selected}
			showSourceHandle={false}
			showTargetHandle={false}
		>
			{/* Header with variable name */}
			<NodeHeader
				icon={Icon}
				iconClassName={isSecret ? "text-red-400" : "text-purple-400"}
				subtitle={isSecret ? "Secret Variable" : "Environment Variable"}
				title={name}
			/>

			{/* Value display section */}
			<NodeContent className="pb-3">
				<div className="flex items-center gap-2">
					{/* Type badge */}
					<span
						className={cn(
							"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
							isSecret ? "bg-red-400/20 text-red-300" : "bg-purple-400/20 text-purple-300"
						)}
					>
						{isSecret ? "Secret" : "Env"}
					</span>
				</div>

				{/* Value preview */}
				<div className="mt-2 flex items-center justify-between gap-2">
					<span className="text-xs text-gray-500">Value:</span>
					<span
						className={cn(
							"max-w-[100px] truncate font-mono text-xs",
							isSecret ? "text-red-300/70" : "text-purple-300",
							!value && !isSecret && "italic text-gray-500"
						)}
					>
						{displayValue()}
					</span>
				</div>
			</NodeContent>
		</BaseNodeWrapper>
	);
});

export default VariableNode;
