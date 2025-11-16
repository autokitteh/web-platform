import React, { useState } from "react";

import { NodeProps } from "@interfaces/components";

import { Button, IconSvg } from "@components/atoms";

import { ChevronDownIcon, TrashIcon } from "@assets/image/icons";
import { FileIcon } from "@assets/image/icons/sidebar";

export const FileNode = ({ node, style, activeFilePath, onFileClick, onFileDelete }: NodeProps) => {
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
			className={`group flex w-full items-center justify-between rounded-lg px-3 py-0 transition-all duration-200 ${
				isHovered ? "bg-gray-1100 text-gray-200" : "text-gray-400 hover:text-gray-200"
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
			<div className="flex min-w-0 flex-1">
				{node.data.isFolder ? (
					<>
						<IconSvg
							className={` size-4 shrink-0 transition-transform duration-200 ${
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
					<IconSvg
						className={`mr-2 size-4 shrink-0 ${isActive ? "stroke-green-800" : "text-gray-400"}`}
						src={FileIcon}
					/>
				)}
				<span
					className={`text-sm ${isActive ? "text-white" : "text-gray-400"} truncate`}
					title={node.data.name}
				>
					{node.data.name.length > 32 ? `${node.data.name.slice(0, 32)}...` : node.data.name}
				</span>
			</div>

			{!node.data.isFolder ? (
				<div
					className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded opacity-0 transition-all hover:bg-gray-1250 group-hover:opacity-100"
					onClick={handleDelete}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							handleDelete(e as any);
						}
					}}
					role="button"
					tabIndex={0}
					title={`Delete ${node.data.name}`}
				>
					<IconSvg className="size-4 stroke-gray-400 hover:stroke-red-500" src={TrashIcon} />
				</div>
			) : null}
		</Button>
	);
};
