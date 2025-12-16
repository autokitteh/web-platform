import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { MdAdd, MdEdit, MdOutlineDelete } from "react-icons/md";

import { folderIcons, getFileIcon } from "@constants/components/fileTree.constants";
import { NodeProps } from "@interfaces/components";
import { ModalName } from "@src/enums";
import { useFileStore, useModalStore } from "@src/store";
import { cn } from "@src/utilities";
import { validateFileName } from "@utilities/files.utils";

import { Button } from "@components/atoms";

export const FileNode = ({
	node,
	style,
	dragHandle,
	activeFilePath,
	onFileClick,
	onFileDelete,
	onlyFilesNoDirectories,
}: NodeProps) => {
	const { t } = useTranslation("validations");
	const { openModal } = useModalStore();
	const [isHovered, setIsHovered] = useState(false);
	const [editValue, setEditValue] = useState(node.data.name);
	const [validationError, setValidationError] = useState("");
	const { getActiveFilePath } = useFileStore();

	const isActive = !node.data.isFolder && activeFilePath === node.data.id;
	const isEditing = node.isEditing;

	const displayedFile = getActiveFilePath();
	const isDisplayedFile = displayedFile === node.data.name;

	const buttonClasses = cn(
		"group flex w-full items-center bg-gray-1100 py-1 text-gray-400 transition-all duration-200 hover:text-gray-200",
		{
			"bg-gray-1250/80 text-white": isDisplayedFile,
		}
	);

	const buttonHoveredClasses = cn({
		"bg-gray-1100 text-gray-200": isHovered,
		"text-gray-400 hover:text-gray-200": !isHovered,
	});

	const nameTextClasses = cn("w-full min-w-0 flex-1 truncate text-start text-sm", {
		"text-white": isActive || isEditing,
		"text-gray-400": !isActive && !isEditing,
	});

	const handleSubmit = () => {
		const validation = validateFileName(editValue, t);
		setValidationError(validation.error);
		if (validation.isValid) {
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

	const buttonClassesWithHovered = cn(buttonClasses, buttonHoveredClasses);
	const fileIconClass = cn("ml-6 size-4", {
		"ml-0": onlyFilesNoDirectories,
	});

	const folderIconChevronClass = cn("mr-1 size-4 shrink-0 transition-transform duration-200", {
		"rotate-90": node.isOpen,
		"rotate-0": !node.isOpen,
	});
	const folderIconDataTestId = `folder-icon-${node.data.path}`;
	const fileIconDataTestId = `file-icon-${node.data.name}`;
	const mainButtonDataTestId = `file-node-${node.data.isFolder ? "directory" : "file"}-${node.data.path}`;
	return (
		<div ref={dragHandle} style={{ ...style, overflow: "visible" }}>
			<Button
				ariaLabel={`Open ${node.data.id}`}
				className={buttonClassesWithHovered}
				data-testid={mainButtonDataTestId}
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
				<div className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
					<div className="flex items-center gap-1">
						{node.data.isFolder ? (
							<>
								<div className={folderIconChevronClass} data-testid={folderIconDataTestId}>
									<svg fill="currentColor" height="16" viewBox="0 0 16 16" width="16">
										<path d="M6 4l4 4-4 4z" />
									</svg>
								</div>
								<FolderIcon className="mr-1" color={folderColor} size={16} />
							</>
						) : (
							<FileIconComponent
								className={fileIconClass}
								color={fileIconData.color}
								data-testid={fileIconDataTestId}
								size={16}
							/>
						)}
					</div>
					{isEditing ? (
						<div className="min-w-0 flex-1">
							<input
								aria-label={`Rename ${node.data.isFolder ? "directory" : "file"} ${node.data.id}`}
								className={nameTextClasses}
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
							{validationError ? <span className="text-xs text-error">{validationError}</span> : null}
						</div>
					) : (
						<span className={nameTextClasses} title={node.data.id}>
							{node.data.name}
						</span>
					)}
				</div>

				{!isEditing ? (
					<div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-row gap-1 opacity-0 transition-all group-hover:bg-gray-1250 group-hover:opacity-100">
						{node.data.isFolder ? (
							<div
								aria-label={`Add file to ${node.data.id}`}
								className="flex size-6 shrink-0 cursor-pointer items-center justify-center transition-colors"
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
								<MdAdd className="size-4 fill-gray-400 hover:fill-green-800" size={16} />
							</div>
						) : null}
						<div
							aria-label={`Rename ${node.data.isFolder ? "directory" : "file"} ${node.data.id}`}
							className="flex size-6 shrink-0 cursor-pointer items-center justify-center transition-colors"
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
							<MdEdit className="size-4 fill-gray-400 hover:fill-green-800" size={16} />
						</div>
						<div
							aria-label={`Delete ${node.data.isFolder ? "directory" : "file"} ${node.data.id}`}
							className="flex size-6 shrink-0 cursor-pointer items-center justify-center transition-colors"
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
							<MdOutlineDelete className="size-4 fill-gray-400 hover:fill-error" size={16} />
						</div>
					</div>
				) : null}
			</Button>
		</div>
	);
};
