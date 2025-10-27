import React, { useMemo, useRef } from "react";

import { useParams } from "react-router-dom";

import { FileTree } from "./fileTree";
import { EventListenerName } from "@src/enums";
import { DrawerName, ModalName } from "@src/enums/components";
import { useEventListener } from "@src/hooks";
import { useCacheStore, useDrawerStore, useFileStore, useModalStore, useSharedBetweenProjectsStore } from "@src/store";
import { TreeNode, buildFileTree } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";

import { Close } from "@assets/image/icons";

export const ProjectFiles = () => {
	const { projectId } = useParams();
	const { openDrawer, closeDrawer } = useDrawerStore();
	const { resources } = useCacheStore();
	const { openFileAsActive, openFiles } = useFileStore();
	const { openModal } = useModalStore();
	const { setIsProjectFilesVisible } = useSharedBetweenProjectsStore();
	const treeContainerRef = useRef<HTMLDivElement>(null);

	const activeFile = openFiles[projectId!]?.find((f: { isActive: boolean }) => f.isActive);
	const activeFileName = activeFile?.name || "";

	const open = () => {
		if (!projectId) return;
		openDrawer(DrawerName.projectFiles);
	};

	const close = () => {
		if (!projectId) return;
		closeDrawer(DrawerName.projectFiles);
	};

	const handleClose = () => {
		if (projectId) {
			setIsProjectFilesVisible(projectId, false);
		}
	};

	useEventListener(EventListenerName.displayProjectFilesSidebar, () => open());
	useEventListener(EventListenerName.hideProjectFilesSidebar, () => close());

	const files = useMemo(() => {
		return Object.keys(resources || {}).filter((name) => name !== "README.md");
	}, [resources]);

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

	const handleFileDelete = (fileName: string) => {
		openModal(ModalName.deleteFile, fileName);
	};

	return (
		<div className="flex size-full flex-col bg-gray-1100">
			<div className="mb-4 flex items-center justify-between border-b border-gray-1200">
				<div className="flex items-center gap-2">
					<svg
						className="size-4 fill-green-800"
						fill="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
					</svg>
					<span className="text-xs font-semibold uppercase tracking-wider text-green-800">Files</span>
				</div>
				<Button
					ariaLabel="Hide Project Files"
					className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
					id="hide-project-files-button"
					onClick={handleClose}
				>
					<IconSvg className="fill-white" src={Close} />
				</Button>
			</div>

			<div className="scrollbar flex-1 overflow-hidden" ref={treeContainerRef}>
				{files.length === 0 ? (
					<div className="flex items-center justify-center py-12 text-sm text-gray-500">
						No files available
					</div>
				) : (
					<FileTree
						activeFilePath={activeFileName}
						data={treeData}
						height={treeContainerRef.current?.clientHeight || 600}
						onFileClick={handleFileClick}
						onFileDelete={handleFileDelete}
					/>
				)}
			</div>
		</div>
	);
};
