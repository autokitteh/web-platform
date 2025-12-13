import React, { memo, useState } from "react";

import { NodeProps, Node } from "@xyflow/react";

import { BaseNodeWrapper, NodeHeader, NodeDivider, NodeContent, FunctionItem } from "./baseNode";
import { FileNodeData } from "@interfaces/store/workflowCanvasStore.interface";
import { cn } from "@utilities";

import { PythonIcon, JavaScriptIcon, TypeScriptIcon, YamlIcon, FileIcon } from "@assets/image/icons";

type FileNodeType = Node<FileNodeData, "file">;

// FileNode represents a code file in the workflow canvas. These are the
// "workers" of AutoKitteh - they contain the Python or JavaScript code
// that actually performs your automation tasks.
//
// A key feature of file nodes is that they display the available functions
// within the file. Triggers connect to specific functions (entry points)
// in these files to start execution when events occur.
//
// Visual structure:
// ┌─────────────────────────┐
// │  🐍 main.py            │  <- Header with language icon and filename
// │     /src/main.py        │  <- Full path as subtitle
// ├─────────────────────────┤
// │  Functions:             │  <- Section showing available entry points
// │   on_github_push()      │
// │   handle_message()      │
// │   process_data()        │
// └─────────────────────────┘
//  ○                       ○  <- Both handles (can receive triggers, can import other files)

// Map file languages to their respective icons and display colors
const languageConfig: Record<
	FileNodeData["language"],
	{
		color: string;
		icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
		label: string;
	}
> = {
	python: {
		icon: PythonIcon || FileIcon,
		color: "text-yellow-400",
		label: "Python",
	},
	javascript: {
		icon: JavaScriptIcon || FileIcon,
		color: "text-yellow-300",
		label: "JavaScript",
	},
	typescript: {
		icon: TypeScriptIcon || FileIcon,
		color: "text-blue-400",
		label: "TypeScript",
	},
	starlark: {
		icon: FileIcon,
		color: "text-orange-400",
		label: "Starlark",
	},
	yaml: {
		icon: YamlIcon || FileIcon,
		color: "text-pink-400",
		label: "YAML",
	},
	unknown: {
		icon: FileIcon,
		color: "text-gray-400",
		label: "File",
	},
};

// Maximum number of functions to show before collapsing
const maxVisibleFunctions = 4;

export const FileNode = memo(function FileNode({ data, selected, isConnectable }: NodeProps<FileNodeType>) {
	// Track whether the functions list is expanded (for files with many functions)
	const [isExpanded, setIsExpanded] = useState(false);

	// Destructure the file data
	const { fileName, filePath, language, functions = [] } = data;

	// Get the visual configuration for this language type
	const langConfig = languageConfig[language] || languageConfig.unknown;
	const LangIcon = langConfig.icon;

	// Determine which functions to display based on expansion state
	const shouldCollapse = functions.length > maxVisibleFunctions;
	const visibleFunctions = isExpanded ? functions : functions.slice(0, maxVisibleFunctions);
	const hiddenCount = functions.length - maxVisibleFunctions;

	return (
		<BaseNodeWrapper
			className="min-w-[220px]"
			isConnectable={isConnectable}
			nodeType="file"
			// File nodes have both handles:
			// - Target handle: receives connections from triggers
			// - Source handle: can connect to other files (for future import visualization)
			selected={selected}
			showSourceHandle={true}
			showTargetHandle={true}
		>
			{/* Header with file name and language icon */}
			<NodeHeader
				icon={LangIcon}
				iconClassName={langConfig.color}
				subtitle={filePath !== fileName ? filePath : undefined}
				title={fileName}
			/>

			{/* Language badge - helps identify the file type at a glance */}
			<NodeContent className="pb-1 pt-0">
				<span
					className={cn(
						"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
						"bg-blue-400/20 text-blue-300"
					)}
				>
					{langConfig.label}
				</span>
			</NodeContent>

			{/* Functions section - this is the key interactive part of file nodes */}
			{functions.length > 0 ? (
				<>
					<NodeDivider />
					<div className="py-2">
						{/* Section header */}
						<div className="px-4 pb-1">
							<span className="text-xs font-medium uppercase tracking-wide text-gray-500">
								Entry Points
							</span>
						</div>

						{/* List of available functions */}
						<div className="space-y-0.5">
							{visibleFunctions.map((funcName) => (
								<FunctionItem
									isEntrypoint={funcName.startsWith("on_")}
									name={funcName}
									// Functions starting with "on_" are typically event handlers
									// and are highlighted as primary entry points
									key={funcName}
								/>
							))}
						</div>

						{/* Show more/less button for files with many functions */}
						{shouldCollapse ? (
							<button
								className={cn(
									"mt-1 w-full px-3 py-1 text-xs text-gray-400",
									"transition-colors hover:text-gray-300"
								)}
								onClick={() => setIsExpanded(!isExpanded)}
								type="button"
							>
								{isExpanded
									? "Show less"
									: `+${hiddenCount} more function${hiddenCount > 1 ? "s" : ""}`}
							</button>
						) : null}
					</div>
				</>
			) : null}

			{/* Empty state when file has no extractable functions */}
			{functions.length === 0 ? (
				<NodeContent className="text-xs italic text-gray-500">No functions detected</NodeContent>
			) : null}
		</BaseNodeWrapper>
	);
});

export default FileNode;
