import React, { useState } from "react";

import { Tree, NodeRendererProps } from "react-arborist";

import { Button, IconSvg } from "@components/atoms";

import { ChevronDownIcon, TrashIcon } from "@assets/image/icons";
import { FileIcon } from "@assets/image/icons/sidebar";

type FileTreeNode = {
	children?: FileTreeNode[];
	id: string;
	isFolder: boolean;
	name: string;
};

interface FileTreeProps {
	data: FileTreeNode[];
	activeFilePath?: string;
	onFileClick: (path: string) => void;
	onFileDelete: (path: string) => void;
	height: number;
}

interface NodeProps {
	node: NodeRendererProps<FileTreeNode>["node"];
	style: NodeRendererProps<FileTreeNode>["style"];
	activeFilePath?: string;
	onFileClick: (path: string) => void;
	onFileDelete: (path: string) => void;
}

const FileNode = ({ node, style, activeFilePath, onFileClick, onFileDelete }: NodeProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const isActive = !node.data.isFolder && activeFilePath === node.data.id;

	const handleClick = () => {
		if (node.data.isFolder) {
			node.toggle();
		} else {
			onFileClick(node.data.id);
		}
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		onFileDelete(node.data.id);
	};

	return (
		<Button
			ariaLabel={`Open ${node.data.name}`}
			className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 transition-all duration-200 ${
				isActive
					? "border-l-2 border-green-800 bg-gray-1200 text-white shadow-sm"
					: isHovered
						? "bg-gray-1100 text-gray-200"
						: "text-gray-400 hover:text-gray-200"
			}`}
			onClick={handleClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleClick();
				}
			}}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={{ ...style }}
			type="button"
		>
			<div className="flex min-w-0 flex-1 items-center gap-2">
				{node.data.isFolder ? (
					<>
						<IconSvg
							className={`size-4 shrink-0 transition-transform duration-200 ${
								node.isOpen ? "rotate-0" : "-rotate-90"
							} ${isActive ? "fill-green-800" : "fill-gray-400 group-hover:fill-green-800"}`}
							src={ChevronDownIcon}
						/>
						<svg
							className={`size-4 shrink-0 ${isActive ? "fill-green-800" : "fill-green-500 group-hover:fill-green-800"}`}
							fill="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
						</svg>
					</>
				) : (
					<>
						<div className="size-4 shrink-0" />
						<IconSvg
							className={`size-4 shrink-0 ${isActive ? "stroke-green-800" : "text-gray-400"}`}
							src={FileIcon}
						/>
					</>
				)}
				<span
					className={`truncate text-sm font-medium ${isActive ? "text-white" : "text-gray-400"}`}
					title={node.data.name}
				>
					{node.data.name}
				</span>
			</div>

			{!node.data.isFolder ? (
				<button
					className="flex size-6 shrink-0 items-center justify-center rounded opacity-0 transition-all hover:bg-gray-1250 group-hover:opacity-100"
					onClick={handleDelete}
					title={`Delete ${node.data.name}`}
					type="button"
				>
					<IconSvg className="size-4 stroke-gray-400 hover:stroke-red-500" src={TrashIcon} />
				</button>
			) : null}
		</Button>
	);
};

export const FileTree = ({ data, activeFilePath, onFileClick, onFileDelete, height }: FileTreeProps) => {
	return (
		<Tree data={data} height={height} indent={12} openByDefault={false} rowHeight={40} width="100%">
			{(props) => (
				<FileNode
					{...props}
					activeFilePath={activeFilePath}
					onFileClick={onFileClick}
					onFileDelete={onFileDelete}
				/>
			)}
		</Tree>
	);
};
