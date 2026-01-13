import React, { useMemo, useState } from "react";

import { MdSearch } from "react-icons/md";
import { useLocation, useParams } from "react-router-dom";

import { FileTree } from "./fileTree";
import { FileTreePopoverContent } from "./fileTreePopoverContent";
import { fileSizeUploadLimit } from "@src/constants";
import { DrawerName, ModalName } from "@src/enums/components";
import { fileOperations } from "@src/factories";
import { useCacheStore, useFileStore, useModalStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";
import { TreeNode, buildFileTree } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";
import { LoadingOverlay } from "@components/molecules";
import { PopoverWrapper, PopoverTrigger } from "@components/molecules/popover";
import { AddFileModal, AddDirectoryModal, DeleteFileModal } from "@components/organisms/files";

import { CirclePlusIcon, Close } from "@assets/image/icons";

export const ProjectFiles = () => {
	const { projectId } = useParams();
	const location = useLocation();
	const { resources } = useCacheStore();
	const { openFileAsActive, openFiles } = useFileStore();
	const { openModal, closeModal, getModalData } = useModalStore();
	const { setIsProjectFilesVisible, closeDrawer } = useSharedBetweenProjectsStore();
	const addToast = useToastStore((state) => state.addToast);
	const { fetchResources } = useCacheStore();
	const [isUploadingFiles, setIsUploadingFiles] = useState(false);
	const [isSearchVisible, setIsSearchVisible] = useState(false);

	const [isDeletingFile, setIsDeletingFile] = useState(false);

	const { saveFile } = fileOperations(projectId!);

	const isOnExplorerPage = location.pathname.includes(`/projects/${projectId}/explorer`);

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

			const successMessage =
				filesToUpload.length === 1
					? `File "${filesToUpload[0].name}" imported successfully`
					: `${filesToUpload.length} files imported successfully`;

			addToast({
				message: successMessage,
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
				await deleteFile(fileName);
			}
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
			if (isOnExplorerPage) {
				setIsProjectFilesVisible(projectId, false);
			} else {
				closeDrawer(projectId, DrawerName.projectFiles);
			}
		}
	};

	type FileTreeNode = {
		children?: FileTreeNode[];
		id: string;
		isFolder: boolean;
		name: string;
		path: string;
	};

	const treeData = useMemo(() => {
		const rawTree = buildFileTree(files);

		const convertToArboristFormat = (nodes: TreeNode[]): FileTreeNode[] => {
			return nodes
				.filter((node) => node.name !== ".keep")
				.map((node) => ({
					id: node.path,
					name: node.name,
					path: node.path,
					isFolder: node.isFolder,
					children: node.children ? convertToArboristFormat(node.children) : undefined,
				}));
		};

		return convertToArboristFormat(rawTree);
	}, [files]);

	const handleFileClick = (fileName: string) => {
		if (!isOnExplorerPage) return;
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

	const fileId = getModalData<string>(ModalName.deleteFile);

	return (
		<>
			<LoadingOverlay isLoading={isUploadingFiles} message="Importing files..." />
			<div className="flex size-full flex-col bg-gray-1100">
				<div className="mb-4 flex w-full items-center justify-between">
					<h2 className="text-base font-semibold text-white">Files</h2>
					<div className="flex items-center gap-1">
						<PopoverWrapper interactionType="click">
							<PopoverTrigger>
								<Button
									ariaLabel="Create new file or directory"
									className="group rounded-full bg-transparent p-1.5 hover:bg-gray-800"
								>
									<CirclePlusIcon className="size-4 stroke-green-800 stroke-[2] transition-all group-hover:stroke-[3]" />
								</Button>
							</PopoverTrigger>
							<FileTreePopoverContent
								handleFileSelect={handleFileSelect}
								isUploadingFiles={isUploadingFiles}
							/>
						</PopoverWrapper>
						<Button
							ariaLabel="Search files"
							className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
							onClick={() => setIsSearchVisible(!isSearchVisible)}
						>
							<MdSearch className="size-5 fill-white" />
						</Button>
						<Button
							ariaLabel="Hide Project Files"
							className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
							data-testid="hide-project-files-button-wrapper"
							onClick={handleClose}
						>
							<IconSvg className="fill-white" src={Close} />
						</Button>
					</div>
				</div>

				<div className="flex flex-col">
					<div
						className="scrollbar w-full flex-1"
						data-testid="project-files-tree-container"
						id="project-files-tree-container"
					>
						<FileTree
							activeFilePath={activeFileName}
							data={treeData}
							onFileClick={handleFileClick}
							onFileDelete={handleFileDelete}
							projectId={projectId!}
							showSearch={isSearchVisible}
						/>
					</div>
				</div>
			</div>
			<AddFileModal />
			<AddDirectoryModal />
			<DeleteFileModal id={fileId || ""} isDeleting={isDeletingFile} onDelete={handleDeleteFile} />
		</>
	);
};
