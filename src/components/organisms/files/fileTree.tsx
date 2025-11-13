import React, { useRef, useState } from "react";

import { Tree, TreeApi } from "react-arborist";

import { FileNode } from "./fileNode";
import { fileTreeClasses } from "@constants/components/files.constants";
import { FileTreeNode, FileTreeProps } from "@interfaces/components";
import { LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { ModalName } from "@src/enums";
import { fileOperations } from "@src/factories";
import { useProjectValidationState } from "@src/hooks";
import { useCacheStore, useModalStore, useToastStore } from "@src/store";

import { Button, FrontendProjectValidationIndicator } from "@components/atoms";
import { DropdownButton } from "@components/molecules";

import { CirclePlusIcon, UploadIcon } from "@assets/image/icons";

export const FileTree = ({
	activeFilePath,
	data,
	handleFileSelect,
	height,
	isUploadingFiles,
	onFileClick,
	onFileDelete,
	projectId,
}: FileTreeProps) => {
	const { openModal } = useModalStore();
	const filesValidation = useProjectValidationState("resources");
	const addToast = useToastStore((state) => state.addToast);
	const { fetchResources } = useCacheStore();
	const [searchTerm, setSearchTerm] = useState("");
	const treeRef = useRef<TreeApi<FileTreeNode> | null>(null);

	const handleRename = async ({ id, name }: { id: string; name: string }) => {
		const node = treeRef.current?.get(id);
		if (!node) return;

		const oldName = node.data.id;
		const isDirectory = node.data.isFolder;

		if (name === oldName) return;

		try {
			const { renameDirectory, renameFile } = fileOperations(projectId);
			let success: boolean | undefined;

			if (isDirectory) {
				success = await renameDirectory(oldName, name);
			} else {
				success = await renameFile(oldName, name);
			}

			if (!success) {
				addToast({
					message: `Failed to rename ${isDirectory ? "directory" : "file"} "${oldName}"`,
					type: "error",
				});

				LoggerService.error(
					namespaces.projectUICode,
					`Failed to rename ${isDirectory ? "directory" : "file"} "${oldName}" to "${name}" in project ${projectId}`
				);
				return;
			}

			await fetchResources(projectId, true);

			addToast({
				message: `${isDirectory ? "Directory" : "File"} renamed successfully`,
				type: "success",
			});
		} catch (error) {
			addToast({
				message: `Failed to rename ${isDirectory ? "directory" : "file"} "${oldName}"`,
				type: "error",
			});

			LoggerService.error(namespaces.projectUICode, `Failed to rename: ${error}`);
		}
	};

	return (
		<>
			<div className={fileTreeClasses.searchContainer}>
				<input
					className={fileTreeClasses.searchInput}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="Search files..."
					type="text"
					value={searchTerm}
				/>
				<p className={fileTreeClasses.keyboardHint}>Use arrow keys to navigate, Enter to open, F2 to rename</p>
			</div>
			<div className={fileTreeClasses.container}>
				<DropdownButton
					contentMenu={
						<>
							<Button
								ariaLabel="Create new file"
								className={fileTreeClasses.dropdown}
								onClick={() => openModal(ModalName.addFile)}
							>
								Create File
							</Button>
							<Button
								ariaLabel="Create new directory"
								className={fileTreeClasses.createButton}
								onClick={() => openModal(ModalName.addDirectory)}
							>
								Create Directory
							</Button>
							<Button onClick={() => {}}>
								<label aria-label="Import files" className={fileTreeClasses.importLabel}>
									<input
										className="hidden"
										disabled={isUploadingFiles}
										multiple
										onChange={handleFileSelect}
										type="file"
									/>
									<UploadIcon className={fileTreeClasses.uploadIcon} />
									<span className={fileTreeClasses.importText}>Import</span>
								</label>
							</Button>
						</>
					}
				>
					<Button
						ariaLabel="Create new file"
						className={fileTreeClasses.mainButton}
						onClick={() => openModal(ModalName.addFile)}
					>
						<CirclePlusIcon className={fileTreeClasses.createIcon} />
						<span className={fileTreeClasses.createText}>Create</span>
					</Button>
				</DropdownButton>
			</div>
			{data.length > 0 ? null : (
				<div className={fileTreeClasses.emptyStateContainer}>
					{filesValidation?.level && filesValidation?.message ? (
						<FrontendProjectValidationIndicator
							level={filesValidation.level}
							message={filesValidation.message}
						/>
					) : null}
					<p className={fileTreeClasses.emptyStateText}>No files available</p>
				</div>
			)}
			<Tree
				data={data}
				height={height}
				indent={12}
				onRename={handleRename}
				openByDefault={false}
				ref={treeRef}
				rowHeight={25}
				searchMatch={(node, term) => node.data.name.toLowerCase().includes(term.toLowerCase())}
				searchTerm={searchTerm}
				width="100%"
			>
				{(props) => (
					<FileNode
						{...props}
						activeFilePath={activeFilePath}
						onFileClick={onFileClick}
						onFileDelete={onFileDelete}
					/>
				)}
			</Tree>
		</>
	);
};
