import React, { useMemo, useRef } from "react";

import { useParams } from "react-router-dom";

import { FileTree } from "./fileTree";
import { defaultProjectFilesWidth } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { DrawerName, ModalName } from "@src/enums/components";
import { useEventListener, useResize } from "@src/hooks";
import { useCacheStore, useDrawerStore, useFileStore, useModalStore, useSharedBetweenProjectsStore } from "@src/store";
import { TreeNode, buildFileTree } from "@src/utilities";

import { ResizeButton } from "@components/atoms";
import { Drawer } from "@components/molecules";

export const ProjectFilesDrawer = () => {
	const { projectId } = useParams();
	const { openDrawer, closeDrawer } = useDrawerStore();
	const { setProjectFilesWidth, projectFilesWidth } = useSharedBetweenProjectsStore();
	const currentProjectFilesWidth = projectFilesWidth[projectId!] || defaultProjectFilesWidth.initial;
	const { resources } = useCacheStore();
	const { openFileAsActive, openFiles } = useFileStore();
	const { openModal } = useModalStore();
	const treeContainerRef = useRef<HTMLDivElement>(null);

	const activeFile = openFiles[projectId!]?.find((f: { isActive: boolean }) => f.isActive);
	const activeFileName = activeFile?.name || "";

	const [drawerWidth] = useResize({
		direction: "horizontal",
		min: defaultProjectFilesWidth.min,
		max: defaultProjectFilesWidth.max,
		initial: currentProjectFilesWidth,
		value: currentProjectFilesWidth,
		id: "project-files-drawer-resize",
		onChange: (width) => {
			if (projectId) {
				setProjectFilesWidth(projectId, width);
			}
		},
		invertDirection: false,
	});

	const open = () => {
		if (!projectId) return;
		openDrawer(DrawerName.projectFiles);
	};

	const close = () => {
		if (!projectId) return;
		closeDrawer(DrawerName.projectFiles);
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
		<Drawer
			bgTransparent
			className="rounded-r-lg bg-gray-1100 pt-4"
			divId="project-sidebar-files"
			isScreenHeight={false}
			name={DrawerName.projectFiles}
			onCloseCallback={close}
			position="left"
			width={drawerWidth}
			wrapperClassName="p-0 relative absolute"
		>
			<div className="flex h-full flex-col px-2 pt-4">
				<div className="mb-4 flex items-center gap-2 border-b border-gray-1200 px-2 pb-2">
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

			<ResizeButton
				className="absolute right-0 top-1/2 z-[125] w-2 -translate-y-1/2 cursor-ew-resize px-1 hover:bg-white"
				direction="horizontal"
				id="project-files-drawer-resize-button"
				resizeId="project-files-drawer-resize"
			/>
		</Drawer>
	);
};
