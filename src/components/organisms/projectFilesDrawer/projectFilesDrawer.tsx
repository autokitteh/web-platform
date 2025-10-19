import React, { useCallback, useMemo } from "react";

import { UncontrolledTreeEnvironment, Tree, TreeItemIndex } from "react-complex-tree";
import { useParams } from "react-router-dom";
import "react-complex-tree/lib/style-modern.css";
import "./projectFilesDrawer.css";

import { defaultProjectFilesWidth } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { DrawerName, ModalName } from "@src/enums/components";
import { useEventListener, useResize } from "@src/hooks";
import { useCacheStore, useDrawerStore, useFileStore, useModalStore, useSharedBetweenProjectsStore } from "@src/store";
import { buildFileTree } from "@src/utilities";

import { IconSvg, ResizeButton } from "@components/atoms";
import { Drawer } from "@components/molecules";

import { TrashIcon } from "@assets/image/icons";

export const ProjectFilesDrawer = () => {
	const { projectId } = useParams();
	const { openDrawer, closeDrawer } = useDrawerStore();
	const { setProjectFilesWidth, projectFilesWidth } = useSharedBetweenProjectsStore();
	const currentProjectFilesWidth = projectFilesWidth[projectId!] || defaultProjectFilesWidth.initial;
	const { resources } = useCacheStore();
	const { openFileAsActive, openFiles } = useFileStore();
	const { openModal } = useModalStore();

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

	const files = Object.keys(resources || {}).filter((name) => name !== "README.md");

	const treeData = useMemo(() => buildFileTree(files), [files]);

	const handleFileClick = (fileName: string) => {
		openFileAsActive(fileName);
	};

	const handleDeleteFile = useCallback(
		(fileName: string, e: React.MouseEvent) => {
			e.stopPropagation();
			openModal(ModalName.deleteFile, fileName);
		},
		[openModal]
	);

	const renderItemTitle = useCallback(
		(context: { item: any; title: string }) => {
			const { item, title } = context;
			const isFolder = item.isFolder;
			const itemPath = item.index as string;

			return (
				<div className="flex w-full items-center justify-between">
					<span>{title}</span>
					{!isFolder && itemPath !== "root" ? (
						<button
							className="flex items-center justify-center rounded bg-transparent p-1 opacity-0 transition-opacity hover:bg-gray-1250 group-hover:opacity-100"
							data-delete-btn
							onClick={(e) => handleDeleteFile(itemPath, e)}
							type="button"
						>
							<IconSvg className="size-4 stroke-white hover:stroke-red-500" src={TrashIcon} />
						</button>
					) : null}
				</div>
			);
		},
		[handleDeleteFile]
	);

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
			<div className="flex h-full flex-col px-4 pt-4">
				<div className="mb-4 text-sm font-semibold uppercase text-gray-400">Files</div>

				<div className="scrollbar flex-1 overflow-y-auto">
					{files.length === 0 ? (
						<div className="flex items-center justify-center py-8 text-sm text-gray-500">
							No files available
						</div>
					) : (
						<UncontrolledTreeEnvironment
							canDragAndDrop={false}
							canDropOnFolder={false}
							canRename={false}
							canReorderItems={false}
							dataProvider={{
								async getTreeItem(itemId: TreeItemIndex) {
									return treeData[itemId];
								},
							}}
							getItemTitle={(item) => item.data as string}
							onSelectItems={(items) => {
								const selectedItem = items[0] as string;
								if (selectedItem && !treeData[selectedItem]?.isFolder) {
									handleFileClick(selectedItem);
								}
							}}
							renderItemTitle={renderItemTitle}
							viewState={{
								"project-files-tree": {
									expandedItems: Object.keys(treeData).filter((key) => treeData[key].isFolder),
									selectedItems: [activeFileName],
								},
							}}
						>
							<Tree rootItem="root" treeId="project-files-tree" treeLabel="Project Files" />
						</UncontrolledTreeEnvironment>
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
