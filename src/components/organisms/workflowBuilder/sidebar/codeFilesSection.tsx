import React, { DragEvent, useState } from "react";

import { LuChevronDown, LuChevronRight, LuCode, LuPlay, LuPlus } from "react-icons/lu";

import { EntryPoint } from "@interfaces/components/workflowBuilder.interface";
import { cn } from "@src/utilities";
import { useWorkflowBuilderStore } from "@store/useWorkflowBuilderStore";

import { Typography } from "@components/atoms";

interface CodeFile {
	fileName: string;
	filePath: string;
	language: "python" | "starlark";
	entryPoints: EntryPoint[];
}

interface CodeFileItemProps {
	file: CodeFile;
	onDragStart: (event: DragEvent<HTMLDivElement>, file: CodeFile) => void;
}

const languageColors: Record<string, { bg: string; text: string }> = {
	python: { text: "text-yellow-400", bg: "bg-yellow-500/20" },
	starlark: { text: "text-blue-400", bg: "bg-blue-500/20" },
};

const CodeFileItem = ({ file, onDragStart }: CodeFileItemProps) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const langColors = languageColors[file.language] || languageColors.python;
	const activeEntryPoints = file.entryPoints.filter((ep) => ep.isActive);

	return (
		<div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
			<div
				className="flex cursor-grab items-center gap-2 px-3 py-2 transition-colors hover:bg-gray-800 active:cursor-grabbing"
				draggable
				onDragStart={(event) => onDragStart(event, file)}
			>
				<button
					className="text-gray-400 hover:text-white"
					onClick={(e) => {
						e.stopPropagation();
						setIsExpanded(!isExpanded);
					}}
					type="button"
				>
					{isExpanded ? <LuChevronDown className="size-4" /> : <LuChevronRight className="size-4" />}
				</button>
				<div className={cn("flex size-6 items-center justify-center rounded", langColors.bg)}>
					<LuCode className={cn("size-4", langColors.text)} />
				</div>
				<div className="min-w-0 flex-1">
					<Typography className="truncate font-medium text-white" element="span" size="small">
						{file.fileName}
					</Typography>
				</div>
				{activeEntryPoints.length > 0 ? (
					<span className="rounded-full bg-green-900/50 px-1.5 py-0.5 text-10 text-green-400">
						{activeEntryPoints.length} active
					</span>
				) : null}
			</div>

			{isExpanded && file.entryPoints.length > 0 ? (
				<div className="border-t border-gray-700 bg-gray-950 px-3 py-2">
					<Typography className="mb-1.5 flex items-center gap-1 text-gray-500" element="span" size="small">
						<LuPlay className="size-3" />
						Entry Points
					</Typography>
					<div className="space-y-1">
						{file.entryPoints.map((ep) => (
							<div
								className={cn(
									"flex items-center gap-2 rounded px-2 py-1",
									ep.isActive ? "bg-green-900/20" : "bg-gray-800"
								)}
								key={ep.name}
							>
								<span
									className={cn(
										"size-1.5 rounded-full",
										ep.isActive ? "bg-green-500" : "bg-gray-600"
									)}
								/>
								<Typography
									className={cn("font-mono", ep.isActive ? "text-green-400" : "text-gray-400")}
									element="span"
									size="small"
								>
									{ep.name}()
								</Typography>
								{ep.lineNumber ? (
									<Typography className="text-gray-600" element="span" size="small">
										:L{ep.lineNumber}
									</Typography>
								) : null}
							</div>
						))}
					</div>
				</div>
			) : null}
		</div>
	);
};

export const CodeFilesSection = () => {
	const [isExpanded, setIsExpanded] = useState(true);
	const { getCodeNodes } = useWorkflowBuilderStore();

	const codeNodes = getCodeNodes();
	const codeFiles: CodeFile[] = codeNodes.map((node) => ({
		fileName: node.data.fileName,
		filePath: node.data.filePath,
		language: node.data.language,
		entryPoints: node.data.entryPoints,
	}));

	const defaultFiles: CodeFile[] =
		codeFiles.length === 0
			? [
					{
						fileName: "program.py",
						filePath: "program.py",
						language: "python",
						entryPoints: [
							{ name: "on_event", lineNumber: 1, isActive: false },
							{ name: "main", lineNumber: 10, isActive: false },
						],
					},
				]
			: [];

	const allFiles = [...codeFiles, ...defaultFiles];

	const handleDragStart = (event: DragEvent<HTMLDivElement>, file: CodeFile) => {
		const dragData = {
			nodeType: "code",
			fileName: file.fileName,
			filePath: file.filePath,
			language: file.language,
			entryPoints: file.entryPoints,
		};
		event.dataTransfer.setData("application/workflow-node", JSON.stringify(dragData));
		event.dataTransfer.effectAllowed = "move";
	};

	return (
		<div className="border-b border-gray-750">
			<button
				className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-900"
				onClick={() => setIsExpanded(!isExpanded)}
				type="button"
			>
				<div className="flex items-center gap-2">
					<LuCode className="size-4 text-blue-400" />
					<Typography className="font-medium text-white" element="span" size="small">
						Code Files
					</Typography>
					{allFiles.length > 0 ? (
						<span className="rounded-full bg-blue-900/50 px-1.5 py-0.5 text-10 text-blue-400">
							{allFiles.length}
						</span>
					) : null}
				</div>
				<LuChevronDown
					className={cn("size-4 text-gray-400 transition-transform", isExpanded && "rotate-180")}
				/>
			</button>

			{isExpanded ? (
				<div className="space-y-2 px-4 pb-4">
					{allFiles.map((file) => (
						<CodeFileItem file={file} key={file.filePath} onDragStart={handleDragStart} />
					))}

					<button
						className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-600 py-2 text-gray-400 transition-colors hover:border-gray-400 hover:bg-gray-900 hover:text-white"
						type="button"
					>
						<LuPlus className="size-4" />
						<Typography element="span" size="small">
							Add Code File
						</Typography>
					</button>
				</div>
			) : null}
		</div>
	);
};
