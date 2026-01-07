import React, { useState } from "react";

import { LuCircleAlert, LuChevronDown, LuChevronUp, LuX } from "react-icons/lu";

import { GraphBuildWarning } from "@interfaces/components/workflowBuilder.interface";
import { cn } from "@utilities";

interface WorkflowBuilderWarningsProps {
	warnings: GraphBuildWarning[];
	onDismiss?: () => void;
	className?: string;
}

const warningTypeLabels: Record<string, string> = {
	orphan_trigger: "Orphan Trigger",
	unused_connection: "Unused Connection",
	missing_entry_point: "Missing Entry Point",
	circular_dependency: "Circular Dependency",
	invalid_connection_ref: "Invalid Connection Reference",
};

export const WorkflowBuilderWarnings = ({ warnings, onDismiss, className }: WorkflowBuilderWarningsProps) => {
	const [isExpanded, setIsExpanded] = useState(false);

	if (warnings.length === 0) {
		return null;
	}

	return (
		<div
			className={cn(
				"absolute left-4 top-4 z-10 max-w-sm rounded-lg border border-yellow-500/30 bg-gray-950/95 shadow-lg backdrop-blur-sm",
				className
			)}
			data-testid="workflow-builder-warnings"
		>
			<div className="flex items-center justify-between gap-2 px-3 py-2">
				<button
					className="flex flex-1 items-center gap-2 text-left"
					onClick={() => setIsExpanded(!isExpanded)}
					type="button"
				>
					<LuCircleAlert className="size-4 shrink-0 text-yellow-500" />
					<span className="text-sm font-medium text-yellow-500">
						{warnings.length} {warnings.length === 1 ? "Warning" : "Warnings"}
					</span>
					{isExpanded ? (
						<LuChevronUp className="size-4 text-gray-500" />
					) : (
						<LuChevronDown className="size-4 text-gray-500" />
					)}
				</button>

				{onDismiss ? (
					<button
						aria-label="Dismiss warnings"
						className="rounded p-0.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
						onClick={onDismiss}
						type="button"
					>
						<LuX className="size-4" />
					</button>
				) : null}
			</div>

			{isExpanded ? (
				<div className="border-t border-gray-800 px-3 py-2">
					<ul className="space-y-2">
						{warnings.map((warning, index) => (
							<li className="text-xs text-gray-400" key={`${warning.type}-${index}`}>
								<span className="font-medium text-gray-300">
									{warningTypeLabels[warning.type] || warning.type}:
								</span>{" "}
								{warning.message}
							</li>
						))}
					</ul>
				</div>
			) : null}
		</div>
	);
};
