import React, { useState } from "react";

import { fileNodeClasses } from "@constants/components/files.constants";
import { NodeProps } from "@interfaces/components";

import { Button, IconSvg } from "@components/atoms";

import { ChevronDownIcon, EditIcon, TrashIcon } from "@assets/image/icons";
import { FileIcon } from "@assets/image/icons/sidebar";

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
						<IconSvg
							className={fileNodeClasses.chevronIcon(node.isOpen, isActive)}
							size="xs"
							src={ChevronDownIcon}
						/>
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
					<IconSvg className={fileNodeClasses.fileIcon(isActive)} size="xs" src={FileIcon} />
				)}
				{isEditing ? (
					<div className="min-w-0 flex-1">
						{}
						<input
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
						{node.data.name.length > 32 ? `${node.data.name.slice(0, 32)}...` : node.data.name}
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
						<IconSvg className={fileNodeClasses.editIcon} src={EditIcon} />
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
						<IconSvg className={fileNodeClasses.deleteIcon} src={TrashIcon} />
					</div>
				</div>
			) : null}
		</Button>
	);
};
