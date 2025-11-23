import React, { useEffect, useRef, useState } from "react";

import { debounce } from "lodash";
import { Tree, TreeApi } from "react-arborist";
import { useTranslation } from "react-i18next";

import { FileNode } from "./fileNode";
import { fileTreeTiming } from "@constants/components/files.constants";
import { FileTreeNode, FileTreeProps } from "@interfaces/components";
import { LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { usePopoverContext } from "@src/contexts";
import { EventListenerName, ModalName } from "@src/enums";
import { fileOperations } from "@src/factories";
import { useEventListener, useProjectValidationState } from "@src/hooks";
import { useCacheStore, useModalStore, useToastStore } from "@src/store";

import { Button, FrontendProjectValidationIndicator } from "@components/atoms";
import { PopoverWrapper, PopoverTrigger, PopoverContent } from "@components/molecules/popover";

import { CirclePlusIcon, PlusIcon, UploadIcon } from "@assets/image/icons";

const FileTreePopoverContent = ({
	handleFileSelect,
	isUploadingFiles,
}: {
	handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
	isUploadingFiles: boolean;
}) => {
	const { t } = useTranslation("files");
	const { openModal } = useModalStore();
	const popover = usePopoverContext();

	const handleAddFileClick = () => {
		openModal(ModalName.addFile);
		popover.close();
	};

	const handleAddDirectoryClick = () => {
		openModal(ModalName.addDirectory);
		popover.close();
	};

	return (
		<PopoverContent className="flex min-w-44 flex-col gap-x-0.5 rounded-lg border-0.5 border-white bg-gray-1250 p-2 pl-3">
			<Button
				ariaLabel="Create new file"
				className="my-0 py-0.5 text-sm text-green-800 hover:underline"
				onClick={handleAddFileClick}
			>
				<PlusIcon className="size-3" fill="#bcf870" />
				{t("createFile")}
			</Button>
			<Button
				ariaLabel="Create new directory"
				className="my-0 py-0.5 text-sm text-green-800 hover:underline"
				onClick={handleAddDirectoryClick}
			>
				<PlusIcon className="size-3" fill="#bcf870" />
				{t("createDirectory")}
			</Button>
			<Button
				className="my-0 py-0.5 text-sm text-green-800 hover:underline"
				onClick={() => {
					popover.close();
				}}
			>
				<label aria-label="Import files" className="group flex w-full cursor-pointer items-center gap-2 !p-0">
					<input
						className="hidden"
						disabled={isUploadingFiles}
						multiple
						onChange={handleFileSelect}
						type="file"
					/>
					<UploadIcon className="size-4 stroke-green-800 stroke-[4] transition-all" />
					<span className="text-sm text-green-800">{t("import")}</span>
				</label>
			</Button>
		</PopoverContent>
	);
};

export const FileTree = ({
	activeFilePath,
	data,
	handleFileSelect,
	isUploadingFiles,
	onFileClick,
	onFileDelete,
	projectId,
}: FileTreeProps) => {
	const { t } = useTranslation(["files", "errors"]);
	const filesValidation = useProjectValidationState("resources");
	const addToast = useToastStore((state) => state.addToast);
	const { fetchResources } = useCacheStore();
	const [searchTerm, setSearchTerm] = useState("");
	const [inputValue, setInputValue] = useState("");
	const treeRef = useRef<TreeApi<FileTreeNode> | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [treeHeight, setTreeHeight] = useState(600);

	const debouncedSetSearchTerm = useRef(
		debounce((value: string) => {
			setSearchTerm(value);
		}, fileTreeTiming.SEARCH_DEBOUNCE_MS)
	).current;

	useEffect(() => {
		return () => {
			debouncedSetSearchTerm.cancel();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

		const pathParts = oldName.split("/");
		const parentPath = pathParts.slice(0, -1).join("/");
		const newFullPath = parentPath ? `${parentPath}/${name}` : name;

		try {
			const { renameDirectory, renameFile } = fileOperations(projectId);
			let success: boolean | undefined;

			if (isDirectory) {
				success = await renameDirectory(oldName, newFullPath);
			} else {
				success = await renameFile(oldName, newFullPath);
			}

			if (!success) {
				addToast({
					message: t(isDirectory ? "directoryRenameFailed" : "fileRenameFailed", {
						[isDirectory ? "directoryName" : "fileName"]: oldName,
						ns: "errors",
					}),
					type: "error",
				});

				LoggerService.error(
					namespaces.projectUICode,
					t(isDirectory ? "directoryRenameFailedExtended" : "fileRenameFailedExtended", {
						[isDirectory ? "directoryName" : "fileName"]: oldName,
						newName: newFullPath,
						projectId,
						ns: "errors",
					})
				);
				return;
			}

			await fetchResources(projectId, true);

			addToast({
				message: t(isDirectory ? "directoryRenamedSuccessfully" : "fileRenamedSuccessfully", { ns: "files" }),
				type: "success",
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			const errorKey = isDirectory ? "directoryRenameFailed" : "fileRenameFailed";

			addToast({
				message: t(errorKey, { [isDirectory ? "directoryName" : "fileName"]: oldName, ns: "errors" }),
				type: "error",
			});

			LoggerService.error(namespaces.projectUICode, `Failed to rename: ${errorMessage}`);
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
				await new Promise((resolve) => setTimeout(resolve, fileTreeTiming.NODE_OPEN_DELAY_MS));
			}
		}

		setTimeout(() => {
			const node = treeRef.current?.get(fileName);
			if (node) {
				node.select();
				treeRef.current?.scrollTo(fileName);
			}
		}, fileTreeTiming.REVEAL_SCROLL_DELAY_MS);
	});

	const handleMove = async ({ dragIds, parentId }: { dragIds: string[]; parentId: string | null | undefined }) => {
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
				if (!parentId) {
					newPath = fileName;
				} else {
					const parentNode = treeRef.current?.get(parentId);
					if (!parentNode) continue;

					if (!parentNode.data.isFolder) {
						addToast({
							message: t("cannotMoveIntoFile", {
								ns: "errors",
								targetPath: parentNode.data.id,
								itemName: fileName,
							}),
							type: "error",
						});

						// eslint-disable-next-line no-console
						console.error(
							t("cannotMoveIntoFile", {
								ns: "errors",
								targetPath: parentNode.data.id,
								itemName: fileName,
							})
						);
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
						message: t(isDirectory ? "directoryMoveFailed" : "fileMoveFailed", {
							[isDirectory ? "directoryName" : "fileName"]: oldPath,
							ns: "errors",
						}),
						type: "error",
					});

					LoggerService.error(
						namespaces.projectUICode,
						t(isDirectory ? "directoryMoveFailedExtended" : "fileMoveFailedExtended", {
							[isDirectory ? "directoryName" : "fileName"]: oldPath,
							newPath,
							projectId,
							ns: "errors",
						})
					);
					continue;
				}

				addToast({
					message: t(isDirectory ? "directoryMovedSuccessfully" : "fileMovedSuccessfully", { ns: "files" }),
					type: "success",
				});
			}

			await fetchResources(projectId, true);
		} catch (error) {
			addToast({
				message: t("moveOperationFailed", { ns: "errors" }),
				type: "error",
			});

			const errorMessage = error instanceof Error ? error.message : String(error);
			LoggerService.error(namespaces.projectUICode, `Failed to move: ${errorMessage}`);
		}
	};

	return (
		<>
			<div className="mb-3">
				<input
					className="w-full rounded-lg border border-gray-800 bg-gray-1100 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-green-800 focus:outline-none"
					onChange={(e) => {
						setInputValue(e.target.value);
						debouncedSetSearchTerm(e.target.value);
					}}
					placeholder={t("searchPlaceholder", { ns: "files" })}
					type="text"
					value={inputValue}
				/>
			</div>
			<div className="flex py-2">
				<PopoverWrapper interactionType="click">
					<PopoverTrigger>
						<Button
							ariaLabel="Create new file or directory"
							className="group mr-4 !p-0 hover:bg-transparent hover:font-semibold"
						>
							<CirclePlusIcon className="size-4 stroke-green-800 stroke-[2] transition-all group-hover:stroke-[3]" />
							<span className="my-0 py-0.5 text-sm text-green-800 hover:underline">Create</span>
						</Button>
					</PopoverTrigger>
					<FileTreePopoverContent handleFileSelect={handleFileSelect} isUploadingFiles={isUploadingFiles} />
				</PopoverWrapper>
			</div>
			{data.length > 0 ? null : (
				<div className="-ml-0.5 mt-1.5 flex gap-1.5">
					{filesValidation?.level && filesValidation?.message ? (
						<FrontendProjectValidationIndicator
							level={filesValidation.level}
							message={filesValidation.message}
						/>
					) : null}
					<p className="text-sm text-gray-300">{t("noFilesAvailable", { ns: "files" })}</p>
				</div>
			)}
			<div
				className="mt-2 pl-1"
				data-testid="file-tree-root"
				id="file-tree-root"
				ref={containerRef}
				style={{ height: "100%", minHeight: 200 }}
			>
				<Tree
					className="!overflow-visible"
					data={data}
					height={treeHeight}
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
