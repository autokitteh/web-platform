import React, { memo, useCallback, useMemo, useState } from "react";

import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { LuCode, LuExternalLink, LuPlay, LuPlug, LuX } from "react-icons/lu";

import { CodeNodeData } from "@interfaces/components/workflowBuilder.interface";
import { ModalName } from "@src/enums";
import { cn } from "@src/utilities";
import { useModalStore } from "@store/useModalStore";
import { useWorkflowBuilderStore } from "@store/useWorkflowBuilderStore";

import { Typography } from "@components/atoms";

type CodeNodeProps = NodeProps<Node<CodeNodeData, "code">>;

const statusColors: Record<string, { bg: string; border: string; iconBg: string }> = {
	draft: { border: "border-gray-600", bg: "bg-gray-900", iconBg: "bg-gray-700" },
	configured: { border: "border-green-500/50", bg: "bg-gray-900", iconBg: "bg-green-900/30" },
	active: { border: "border-blue-500", bg: "bg-gray-900", iconBg: "bg-blue-900/30" },
	error: { border: "border-red-500", bg: "bg-gray-900", iconBg: "bg-red-900/30" },
};

const languageIcons: Record<string, { color: string; label: string }> = {
	python: { color: "text-yellow-400", label: "Python" },
	starlark: { color: "text-blue-400", label: "Starlark" },
};

const CodeNodeComponent = ({ id, data, selected }: CodeNodeProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const { openModal } = useModalStore();
	const { setSelectedNodeId } = useWorkflowBuilderStore();

	const status = statusColors[data.status] || statusColors.draft;
	const langConfig = languageIcons[data.language] || languageIcons.python;

	const handleDeleteClick = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			openModal(ModalName.deleteWorkflowNode, { nodeId: id, nodeName: data.fileName });
		},
		[id, data.fileName, openModal]
	);

	const handleNodeClick = useCallback(() => {
		setSelectedNodeId(id);
	}, [id, setSelectedNodeId]);

	const handleViewCode = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			openModal(ModalName.codeEditor, { filePath: data.filePath });
		},
		[data.filePath, openModal]
	);

	const deleteButtonClass = useMemo(
		() =>
			cn(
				"absolute -right-2 -top-2 z-10 flex size-5 cursor-pointer items-center justify-center rounded-full border border-red-500 bg-gray-900 transition-all duration-200",
				isHovered ? "scale-100 opacity-100" : "scale-0 opacity-0"
			),
		[isHovered]
	);

	const containerClass = useMemo(
		() =>
			cn(
				"relative min-w-[200px] max-w-280 rounded-xl border-2 p-4 shadow-lg transition-all duration-200",
				status.border,
				status.bg,
				selected && "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-950",
				isHovered && "shadow-xl"
			),
		[status.border, status.bg, selected, isHovered]
	);

	const activeEntryPoints = data.entryPoints.filter((ep) => ep.isActive);
	const inactiveEntryPoints = data.entryPoints.filter((ep) => !ep.isActive);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				handleNodeClick();
			}
		},
		[handleNodeClick]
	);

	return (
		<div
			className={containerClass}
			onClick={handleNodeClick}
			onKeyDown={handleKeyDown}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			role="button"
			tabIndex={0}
		>
			<button className={deleteButtonClass} onClick={handleDeleteClick} type="button">
				<LuX className="size-3 text-red-500" />
			</button>

			<Handle
				className="!-top-2 !h-3 !w-3 !rounded-full !border-2 !border-gray-700 !bg-blue-500"
				id="top"
				position={Position.Top}
				type="target"
			/>

			<div className="flex items-start justify-between">
				<div className="flex items-center gap-2">
					<div className={cn("flex size-8 items-center justify-center rounded-lg", status.iconBg)}>
						<LuCode className={cn("size-4", langConfig.color)} />
					</div>
					<div>
						<Typography className="font-medium text-white" element="span" size="small">
							{data.fileName}
						</Typography>
						<Typography className={cn("block text-10", langConfig.color)} element="span">
							{langConfig.label}
						</Typography>
					</div>
				</div>
				<button
					className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
					onClick={handleViewCode}
					type="button"
				>
					<LuExternalLink className="size-4" />
				</button>
			</div>

			{activeEntryPoints.length > 0 || inactiveEntryPoints.length > 0 ? (
				<div className="mt-3 border-t border-gray-700 pt-3">
					<Typography className="mb-2 flex items-center gap-1 text-gray-400" element="span" size="small">
						<LuPlay className="size-3" />
						Entry Points
					</Typography>
					<div className="space-y-1">
						{activeEntryPoints.map((ep) => (
							<div className="flex items-center gap-2 rounded bg-green-900/20 px-2 py-1" key={ep.name}>
								<span className="size-1.5 rounded-full bg-green-500" />
								<Typography className="text-green-400" element="span" size="small">
									{ep.name}()
								</Typography>
							</div>
						))}
						{inactiveEntryPoints.slice(0, 3).map((ep) => (
							<div className="flex items-center gap-2 px-2 py-1" key={ep.name}>
								<span className="size-1.5 rounded-full bg-gray-600" />
								<Typography className="text-gray-500" element="span" size="small">
									{ep.name}()
								</Typography>
							</div>
						))}
						{inactiveEntryPoints.length > 3 ? (
							<Typography className="px-2 text-gray-600" element="span" size="small">
								+{inactiveEntryPoints.length - 3} more
							</Typography>
						) : null}
					</div>
				</div>
			) : null}

			{data.usedConnections.length > 0 ? (
				<div className="mt-3 border-t border-gray-700 pt-3">
					<Typography className="mb-2 flex items-center gap-1 text-gray-400" element="span" size="small">
						<LuPlug className="size-3" />
						Connections ({data.usedConnections.length})
					</Typography>
					<div className="flex flex-wrap gap-1">
						{data.usedConnections.map((conn) => (
							<span className="rounded-full bg-gray-800 px-2 py-0.5 text-10 text-gray-300" key={conn}>
								{conn}
							</span>
						))}
					</div>
				</div>
			) : null}

			<Handle
				className="!-bottom-2 !h-3 !w-3 !rounded-full !border-2 !border-gray-700 !bg-green-500"
				id="bottom"
				position={Position.Bottom}
				type="source"
			/>
			<Handle
				className="!-left-2 !h-3 !w-3 !rounded-full !border-2 !border-gray-700 !bg-green-500"
				id="left"
				position={Position.Left}
				type="target"
			/>
			<Handle
				className="!-right-2 !h-3 !w-3 !rounded-full !border-2 !border-gray-700 !bg-green-500"
				id="right"
				position={Position.Right}
				type="source"
			/>
		</div>
	);
};

export const CodeNode = memo(CodeNodeComponent);
