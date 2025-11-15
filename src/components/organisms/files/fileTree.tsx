import React, { useEffect, useRef, useState } from "react";

import { Tree, TreeApi } from "react-arborist";

import { FileNode } from "./fileNode";
import { fileTreeClasses } from "@constants/components/files.constants";
import { FileTreeNode, FileTreeProps } from "@interfaces/components";
import { LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { EventListenerName, ModalName } from "@src/enums";
import { fileOperations } from "@src/factories";
import { useEventListener, useProjectValidationState } from "@src/hooks";
import { useCacheStore, useModalStore, useToastStore } from "@src/store";

import { Button, FrontendProjectValidationIndicator } from "@components/atoms";
import { DropdownButton } from "@components/molecules";

import { CirclePlusIcon, UploadIcon } from "@assets/image/icons";

export const FileTree = ({
	activeFilePath,
	data,
	handleFileSelect,
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
	const containerRef = useRef<HTMLDivElement>(null);
	const [treeHeight, setTreeHeight] = useState(600);

	useEffect(() => {
		const updateHeight = () => {
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				const availableHeight = window.innerHeight - rect.top - 20;
				setTreeHeight(Math.max(200, availableHeight));
			}
		};

		updateHeight();
		window.addEventListener("resize", updateHeight);
		return () => window.removeEventListener("resize", updateHeight);
	}, []);

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

	useEventListener(EventListenerName.revealFileInTree, async (event) => {
		const { fileName } = event.detail;
		if (!treeRef.current || !fileName) return;

		const pathParts = fileName.split("/");

		for (let i = 0; i < pathParts.length - 1; i++) {
			const folderPath = pathParts.slice(0, i + 1).join("/");
			const folderNode = treeRef.current.get(folderPath);
			if (folderNode && !folderNode.isOpen) {
				folderNode.open();
				await new Promise((resolve) => setTimeout(resolve, 50));
			}
		}

		setTimeout(() => {
			const node = treeRef.current?.get(fileName);
			if (node) {
				node.select();
				treeRef.current?.scrollTo(fileName);
			}
		}, 50);
	});

	const handleMove = async ({ dragIds, parentId }: { dragIds: string[]; parentId: string | null }) => {
		if (dragIds.length === 0) return;

		try {
			const { moveDirectory, moveFile } = fileOperations(projectId);

			for (const dragId of dragIds) {
				const node = treeRef.current?.get(dragId);
				if (!node) continue;

				const oldPath = node.data.id;
				const isDirectory = node.data.isFolder;
				const fileName = oldPath.split("/").pop() || oldPath;

				let newPath: string;
				if (parentId === null) {
					newPath = fileName;
				} else {
					const parentNode = treeRef.current?.get(parentId);
					if (!parentNode) continue;

					if (!parentNode.data.isFolder) {
						addToast({
							message: "Cannot move into a file",
							type: "error",
						});
						continue;
					}

					const parentPath = parentNode.data.id;
					newPath = `${parentPath}/${fileName}`;
				}

				if (oldPath === newPath) continue;

				let success: boolean | undefined;
				if (isDirectory) {
					success = await moveDirectory(oldPath, newPath);
				} else {
					success = await moveFile(oldPath, newPath);
				}

				if (!success) {
					addToast({
						message: `Failed to move ${isDirectory ? "directory" : "file"} "${oldPath}"`,
						type: "error",
					});

					LoggerService.error(
						namespaces.projectUICode,
						`Failed to move ${isDirectory ? "directory" : "file"} "${oldPath}" to "${newPath}" in project ${projectId}`
					);
					continue;
				}

				addToast({
					message: `${isDirectory ? "Directory" : "File"} moved successfully`,
					type: "success",
				});
			}

			await fetchResources(projectId, true);
		} catch (error) {
			addToast({
				message: "Failed to move item",
				type: "error",
			});

			LoggerService.error(namespaces.projectUICode, `Failed to move: ${error}`);
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
				{/* <p className={fileTreeClasses.keyboardHint}>Use arrow keys to navigate, Enter to open, F2 to rename</p> */}
			</div>
			<div className={fileTreeClasses.container}>
				<DropdownButton
					contentMenu={
						<>
							<Button
								ariaLabel="Create new file"
								className={fileTreeClasses.createText}
								onClick={() => openModal(ModalName.addFile)}
							>
								Create File
							</Button>
							<Button
								ariaLabel="Create new directory"
								className={fileTreeClasses.createText}
								onClick={() => openModal(ModalName.addDirectory)}
							>
								Create Directory
							</Button>
							<Button className={fileTreeClasses.importButton} onClick={() => {}}>
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
			<div ref={containerRef} style={{ height: "100%", minHeight: 200 }}>
				<Tree
					data={data}
					height={treeHeight}
					indent={18}
					onMove={handleMove}
					onRename={handleRename}
					openByDefault={false}
					ref={treeRef}
					rowHeight={30}
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
			</div>
		</>
	);
};
