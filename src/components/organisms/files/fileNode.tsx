import React, { useState } from "react";

import { MdEdit, MdOutlineDelete } from "react-icons/md";

import { fileNodeClasses } from "@constants/components/files.constants";
import { folderIcons, getFileIcon } from "@constants/components/fileTree.constants";
import { NodeProps } from "@interfaces/components";
import { cn } from "@src/utilities";

import { Button } from "@components/atoms";

export const FileNode = ({ node, style, activeFilePath, onFileClick, onFileDelete }: NodeProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const [editValue, setEditValue] = useState(node.data.name);
	const [validationError, setValidationError] = useState("");

	const isActive = !node.data.isFolder && activeFilePath === node.data.id;
	const isEditing = node.isEditing;

	const validateName = (name: string): boolean => {
		if (!name.trim()) {
			setValidationError("Name cannot be empty");
			return false;
		}

		const invalidChars = /[<>:"/\\|?*]/;
		if (invalidChars.test(name)) {
			setValidationError("Name contains invalid characters");
			return false;
		}

		for (let i = 0; i < name.length; i++) {
			if (name.charCodeAt(i) < 32) {
				setValidationError("Name contains invalid characters");
				return false;
			}
		}

		if (name !== name.trim()) {
			setValidationError("Name cannot have leading or trailing spaces");
			return false;
		}

		setValidationError("");
		return true;
	};

	const handleSubmit = () => {
		if (validateName(editValue)) {
			node.submit(editValue);
		}
	};

	const handleClick = () => {
		if (!isEditing) {
			if (node.data.isFolder) {
				node.toggle();
			} else {
				node.select();
				onFileClick(node.data.id);
			}
		}
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		onFileDelete(node.data.id, node.data.isFolder);
	};

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		setEditValue(node.data.name);
		setValidationError("");
		node.edit();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			e.stopPropagation();
			handleSubmit();
		} else if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			setValidationError("");
			node.reset();
		}
	};

	const handleBlur = () => {
		if (!validationError) {
			handleSubmit();
		}
	};

	const FolderIcon = node.isOpen ? folderIcons.open.icon : folderIcons.closed.icon;
	const folderColor = node.isOpen ? folderIcons.open.color : folderIcons.closed.color;
	const fileIconData = getFileIcon(node.data.name);
	const FileIconComponent = fileIconData.icon;

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
			style={style}
			type="button"
		>
			<div className={fileNodeClasses.nameContainer}>
				{node.data.isFolder ? (
					<>
						<div className="mr-1 size-4 shrink-0">
							<svg
								className={cn("size-4 shrink-0 transition-transform duration-200", {
									"rotate-90": node.isOpen,
									"rotate-0": !node.isOpen,
								})}
								fill="currentColor"
								height="16"
								viewBox="0 0 16 16"
								width="16"
							>
								<path d="M6 4l4 4-4 4z" />
							</svg>
						</div>
						<FolderIcon className="mr-1" color={folderColor} size={16} />
					</>
				) : (
					<FileIconComponent className="size-4" color={fileIconData.color} size={16} />
				)}
				{isEditing ? (
					<div className="min-w-0 flex-1">
						<input
							className={fileNodeClasses.nameText(isActive, isEditing)}
							onBlur={handleBlur}
							onChange={(e) => setEditValue(e.target.value)}
							onClick={(e) => e.stopPropagation()}
							onKeyDown={handleKeyDown}
							type="text"
							value={editValue}
						/>
						{validationError ? (
							<span className={fileNodeClasses.validationError}>{validationError}</span>
						) : null}
					</div>
				) : (
					<span className={fileNodeClasses.nameText(isActive, isEditing)} title={node.data.name}>
						{node.data.name}
					</span>
				)}
			</div>

			{!isEditing ? (
				<div className={fileNodeClasses.actionsContainer}>
					<div
						className={fileNodeClasses.actionButton}
						onClick={handleEdit}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								handleEdit(e as any);
							}
						}}
						role="button"
						tabIndex={0}
						title={`Rename ${node.data.name}`}
					>
						<MdEdit className={fileNodeClasses.editIcon} size={16} />
					</div>
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
						title={`Delete ${node.data.isFolder ? "directory" : "file"} ${node.data.name}`}
					>
						<MdOutlineDelete className={fileNodeClasses.deleteIcon} size={16} />
					</div>
				</div>
			) : null}
		</Button>
	);
};
