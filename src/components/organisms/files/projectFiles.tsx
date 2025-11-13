import React, { useMemo, useRef, useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { FileTree } from "./fileTree";
import { fileSizeUploadLimit } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { fileOperations } from "@src/factories";
import { useCacheStore, useFileStore, useModalStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";
import { TreeNode, buildFileTree, calculateOptimalSplitFrameWidth } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";
import { AddFileModal } from "@components/organisms/files";
import { AddDirectoryModal } from "@components/organisms/files/addDirectoryModal";
import { DeleteFileModal } from "@components/organisms/files/deleteModal";
import { RenameModal } from "@components/organisms/files/renameModal";

import { Close } from "@assets/image/icons";

export const ProjectFiles = () => {
	const { projectId } = useParams();
	const { resources } = useCacheStore();
	const { openFileAsActive, openFiles } = useFileStore();
	const { openModal, closeModal, getModalData } = useModalStore();
	const { setIsProjectFilesVisible, setEditorWidth } = useSharedBetweenProjectsStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchResources } = useCacheStore();
	const { closeOpenedFile } = useFileStore();
	const treeContainerRef = useRef<HTMLDivElement>(null);
	const [isUploadingFiles, setIsUploadingFiles] = useState(false);

	const [isDeletingFile, setIsDeletingFile] = useState(false);

	const { saveFile } = fileOperations(projectId!);

	const handleFileUpload = async (filesToUpload: File[]) => {
		try {
			setIsUploadingFiles(true);
			let firstFileLoaded = true;

			for (const file of filesToUpload) {
				if (file.size > fileSizeUploadLimit) {
					setIsUploadingFiles(false);
					addToast({
						message: `File too large: ${file.name}`,
						type: "error",
					});
					return;
				}

				const fileContent = await file.text();
				await saveFile(file.name, fileContent);

				if (firstFileLoaded) {
					openFileAsActive(file.name);
					firstFileLoaded = false;
				}
			}

			await fetchResources(projectId!, true);
			setIsUploadingFiles(false);

			addToast({
				message:
					filesToUpload.length === 1
						? `File "${filesToUpload[0].name}" imported successfully`
						: `${filesToUpload.length} files imported successfully`,
				type: "success",
			});
		} catch (error) {
			setIsUploadingFiles(false);
			addToast({
				message: `Failed to import file: ${(error as Error).message}`,
				type: "error",
			});
		}
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(event.target.files || []);
		if (selectedFiles.length > 0) {
			handleFileUpload(selectedFiles);
		}
		event.target.value = "";
	};

	const handleDeleteFile = async () => {
		const modalData = getModalData<{ fileCount?: number; isDirectory?: boolean; name: string } | string>(
			ModalName.deleteFile
		);
		if (!modalData || !projectId) return;

		setIsDeletingFile(true);
		const { deleteDirectory, deleteFile } = fileOperations(projectId);

		const fileName = typeof modalData === "string" ? modalData : modalData.name;
		const isDirectory = typeof modalData === "object" && modalData.isDirectory;

		try {
			if (isDirectory) {
				await deleteDirectory(fileName);
			} else {
				await closeOpenedFile(fileName);
				await deleteFile(fileName);
			}
			await fetchResources(projectId, true);
			setIsDeletingFile(false);
			closeModal(ModalName.deleteFile);

			addToast({
				message: `${isDirectory ? "Directory" : "File"} "${fileName}" deleted successfully`,
				type: "success",
			});
		} catch (error) {
			setIsDeletingFile(false);
			closeModal(ModalName.deleteFile);

			addToast({
				message: (error as Error).message,
				type: "error",
			});
		}
	};

	const activeFile = openFiles[projectId!]?.find((f: { isActive: boolean }) => f.isActive);
	const activeFileName = activeFile?.name || "";

	const files = useMemo(() => {
		return Object.keys(resources || {});
	}, [resources]);

	const handleClose = () => {
		if (projectId) {
			setIsProjectFilesVisible(projectId, false);
		}
	};

	type FileTreeNode = {
		children?: FileTreeNode[];
		id: string;
		isFolder: boolean;
		name: string;
	};

	const treeData = useMemo(() => {
		const rawTree = buildFileTree(files);

		const convertToArboristFormat = (nodes: TreeNode[]): FileTreeNode[] => {
			return nodes.map((node) => ({
				id: node.path,
				name: node.name,
				isFolder: node.isFolder,
				children: node.children ? convertToArboristFormat(node.children) : undefined,
			}));
		};

		return convertToArboristFormat(rawTree);
	}, [files]);

	const handleFileClick = (fileName: string) => {
		openFileAsActive(fileName);
	};

	const handleFileDelete = (fileName: string, isDirectory?: boolean) => {
		if (isDirectory) {
			const normalizedPath = fileName.endsWith("/") ? fileName : `${fileName}/`;
			const filesInDirectory = Object.keys(resources || {}).filter((file) => file.startsWith(normalizedPath));

			openModal(ModalName.deleteFile, {
				fileCount: filesInDirectory.length,
				isDirectory: true,
				name: fileName,
			});
		} else {
			openModal(ModalName.deleteFile, fileName);
		}
	};

	const handleFileRename = (fileName: string, isDirectory?: boolean) => {
		openModal(ModalName.renameFileOrDirectory, {
			isDirectory: isDirectory || false,
			oldName: fileName,
		});
	};

	useEffect(() => {
		if (projectId && !!files?.length) {
			const optimalWidth = calculateOptimalSplitFrameWidth(Object.keys(resources || {}), 35, 15);
			setEditorWidth(projectId, { explorer: optimalWidth });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [files, projectId]);

	const fileId = getModalData<string>(ModalName.deleteFile);

	return (
		<>
			<div className="flex size-full flex-col bg-gray-1100">
				<div className="mb-4 flex w-full items-center justify-between">
					<h2 className="text-base font-semibold text-white">Files</h2>
					<Button
						ariaLabel="Hide Project Files"
						className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
						id="hide-project-files-button"
						onClick={handleClose}
					>
						<IconSvg className="fill-white" src={Close} />
					</Button>
				</div>

				<div className="flex flex-col">
					<div className="scrollbar w-full flex-1 overflow-hidden" ref={treeContainerRef}>
						<FileTree
							activeFilePath={activeFileName}
							data={treeData}
							handleFileSelect={handleFileSelect}
							height={treeContainerRef.current?.clientHeight || 600}
							isUploadingFiles={isUploadingFiles}
							onFileClick={handleFileClick}
							onFileDelete={handleFileDelete}
							onFileRename={handleFileRename}
						/>
					</div>
				</div>
			</div>
			<AddFileModal />
			<AddDirectoryModal />
			<RenameModal />
			<DeleteFileModal id={fileId || ""} isDeleting={isDeletingFile} onDelete={handleDeleteFile} />
		</>
	);
};
