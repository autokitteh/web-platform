import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { MdAdd, MdEdit, MdOutlineDelete } from "react-icons/md";

import { fileNodeClasses } from "@constants/components/files.constants";
import { folderIcons, getFileIcon } from "@constants/components/fileTree.constants";
import { NodeProps } from "@interfaces/components";
import { ModalName } from "@src/enums";
import { useFileStore, useModalStore } from "@src/store";
import { cn } from "@src/utilities";

import { Button } from "@components/atoms";

export const FileNode = ({ node, style, dragHandle, activeFilePath, onFileClick, onFileDelete }: NodeProps) => {
	const { t } = useTranslation("validations");
	const { openModal } = useModalStore();
	const [isHovered, setIsHovered] = useState(false);
	const [editValue, setEditValue] = useState(node.data.name);
	const [validationError, setValidationError] = useState("");
	const { getActiveFilePath } = useFileStore();

	const isActive = !node.data.isFolder && activeFilePath === node.data.id;
	const isEditing = node.isEditing;

	const validateName = (name: string): boolean => {
		if (!name.trim()) {
			setValidationError(t("fileName.nameRequired"));
			return false;
		}

		const invalidChars = /[<>:"/\\|?*]/;
		if (invalidChars.test(name)) {
			setValidationError(t("fileName.invalidCharacters"));
			return false;
		}

		for (let i = 0; i < name.length; i++) {
			if (name.charCodeAt(i) < 32) {
				setValidationError(t("fileName.invalidCharacters"));
				return false;
			}
		}

		if (name !== name.trim()) {
			setValidationError(t("fileName.leadingTrailingSpaces"));
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

	const handleAddFileInDirectory = (e: React.MouseEvent) => {
		e.stopPropagation();
		openModal(ModalName.addFile, { directoryPath: node.data.id });
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

	const displayedFile = getActiveFilePath();
	const isDisplayedFile = displayedFile === node.data.id;

	return (
		<div ref={dragHandle} style={style}>
			<Button
				ariaLabel={`Open ${node.data.id}`}
				className={`${fileNodeClasses.button(isDisplayedFile)} ${fileNodeClasses.buttonHovered(isHovered)}`}
				data-testid={`file-node-${node.data.isFolder ? "directory" : "file"}-${node.data.name}`}
				onClick={handleClick}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						handleClick();
					}
				}}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
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
								aria-label={`Rename ${node.data.isFolder ? "directory" : "file"} ${node.data.id}`}
								className={fileNodeClasses.nameText(isActive, isEditing)}
								data-testid={`rename-${node.data.isFolder ? "directory" : "file"}-${node.data.name}`}
								id={`rename-${node.data.isFolder ? "directory" : "file"}-${node.data.name}`}
								onBlur={handleBlur}
								onChange={(e) => setEditValue(e.target.value)}
								onClick={(e) => e.stopPropagation()}
								onKeyDown={handleKeyDown}
								placeholder={`Rename ${node.data.isFolder ? "directory" : "file"} ${node.data.name}`}
								title={`Rename ${node.data.isFolder ? "directory" : "file"} ${node.data.id}`}
								type="text"
								value={editValue}
							/>
							{validationError ? (
								<span className={fileNodeClasses.validationError}>{validationError}</span>
							) : null}
						</div>
					) : (
						<span className={fileNodeClasses.nameText(isActive, isEditing)} title={node.data.id}>
							{node.data.name}
						</span>
					)}
				</div>

				{!isEditing ? (
					<div className={fileNodeClasses.actionsContainer}>
						{node.data.isFolder ? (
							<div
								aria-label={`Add file to ${node.data.id}`}
								className={fileNodeClasses.actionButton}
								onClick={handleAddFileInDirectory}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										handleAddFileInDirectory(e as any);
									}
								}}
								role="button"
								tabIndex={0}
								title={`Add file to ${node.data.id}`}
							>
								<MdAdd className={fileNodeClasses.editIcon} size={16} />
							</div>
						) : null}
						<div
							aria-label={`Rename ${node.data.isFolder ? "directory" : "file"} ${node.data.id}`}
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
							title={`Rename ${node.data.id}`}
						>
							<MdEdit className={fileNodeClasses.editIcon} size={16} />
						</div>
						<div
							aria-label={`Delete ${node.data.isFolder ? "directory" : "file"} ${node.data.id}`}
							className={fileNodeClasses.actionButton}
							data-testid={`delete-${node.data.isFolder ? "directory" : "file"}-${node.data.name}`}
							onClick={handleDelete}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									handleDelete(e as any);
								}
							}}
							role="button"
							tabIndex={0}
							title={`Delete ${node.data.isFolder ? "directory" : "file"} ${node.data.id}`}
						>
							<MdOutlineDelete className={fileNodeClasses.deleteIcon} size={16} />
						</div>
					</div>
				) : null}
			</Button>
		</div>
	);
};
