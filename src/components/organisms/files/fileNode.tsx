import React, { useState } from "react";

import { fileNodeClasses } from "@constants/components/files.constants";
import { NodeProps } from "@interfaces/components";

import { Button, IconSvg } from "@components/atoms";

import { ChevronDownIcon, EditIcon, TrashIcon } from "@assets/image/icons";
import { FileIcon } from "@assets/image/icons/sidebar";

export const FileNode = ({ node, style, activeFilePath, onFileClick, onFileDelete, onFileRename }: NodeProps) => {
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
		onFileDelete(node.data.id, node.data.isFolder);
	};

	const handleRename = (e: React.MouseEvent) => {
		e.stopPropagation();
		onFileRename(node.data.id, node.data.isFolder);
	};

	return (
		<Button
			ariaLabel={`Open ${node.data.name}`}
			className={`${fileNodeClasses.button} ${fileNodeClasses.buttonHovered(isHovered)}`}
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
			<div className={fileNodeClasses.nameContainer}>
				{node.data.isFolder ? (
					<>
						<IconSvg className={fileNodeClasses.chevronIcon(node.isOpen, isActive)} src={ChevronDownIcon} />
						<svg
							className={fileNodeClasses.folderIcon(isActive)}
							fill="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
						</svg>
					</>
				) : (
					<IconSvg className={fileNodeClasses.fileIcon(isActive)} src={FileIcon} />
				)}
				<span className={fileNodeClasses.nameText(isActive)} title={node.data.name}>
					{node.data.name.length > 32 ? `${node.data.name.slice(0, 32)}...` : node.data.name}
				</span>
			</div>

			<div className={fileNodeClasses.actionsContainer}>
				<div
					className={fileNodeClasses.actionButton}
					onClick={handleRename}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							handleRename(e as any);
						}
					}}
					role="button"
					tabIndex={0}
					title={`Rename ${node.data.name}`}
				>
					<IconSvg className={fileNodeClasses.editIcon} src={EditIcon} />
				</div>
				{!node.data.isFolder ? (
					<div
						className={fileNodeClasses.actionButton}
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
						<IconSvg className={fileNodeClasses.deleteIcon} src={TrashIcon} />
					</div>
				) : null}
				{node.data.isFolder ? (
					<div
						className={fileNodeClasses.actionButton}
						onClick={handleDelete}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								handleDelete(e as any);
							}
						}}
						role="button"
						tabIndex={0}
						title={`Delete directory ${node.data.name}`}
					>
						<IconSvg className={fileNodeClasses.deleteIcon} src={TrashIcon} />
					</div>
				) : null}
			</div>
		</Button>
	);
};
