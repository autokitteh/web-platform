import React from "react";

import { useLocation, useParams } from "react-router-dom";

import { defaultProjectFilesWidth } from "@src/constants";
import { DrawerName } from "@src/enums/components";
import { useResize } from "@src/hooks";
import { useSharedBetweenProjectsStore } from "@src/store";

import { ResizeButton } from "@components/atoms";
import { Drawer } from "@components/molecules";
import { ProjectFiles } from "@components/organisms";

export const FilesDrawer = () => {
	const location = useLocation();
	const { projectId } = useParams();
	const closeDrawer = useSharedBetweenProjectsStore((state) => state.closeDrawer);
	const { projectFilesWidth, setProjectFilesWidth } = useSharedBetweenProjectsStore();

	const currentWidth = projectFilesWidth[projectId!] || defaultProjectFilesWidth.initial;

	const [drawerWidth] = useResize({
		direction: "horizontal",
		min: defaultProjectFilesWidth.min,
		max: defaultProjectFilesWidth.max,
		initial: currentWidth,
		value: currentWidth,
		id: "files-drawer-resize",
		onChange: (width) => {
			if (projectId) {
				setProjectFilesWidth(projectId, width);
			}
		},
	});

	const close = () => {
		if (!projectId) return;
		closeDrawer(projectId, DrawerName.projectFiles);
	};

	const isExplorerPage = location.pathname.includes("/explorer");
	if (!location.pathname.startsWith("/projects") || isExplorerPage) {
		return null;
	}

	return (
		<Drawer
			bgClickable
			bgTransparent
			className="rounded-lg border-r border-gray-1050 bg-gray-1100"
			divId="project-files-drawer"
			isScreenHeight={false}
			name={DrawerName.projectFiles}
			onCloseCallback={close}
			position="left"
			width={drawerWidth}
			wrapperClassName="p-0 relative absolute"
		>
			<div className="relative flex size-full">
				<div className="flex-1 overflow-hidden">
					<ProjectFiles />
				</div>
				<ResizeButton
					className="hover:bg-white"
					dataTestId="files-drawer-resize-button"
					direction="horizontal"
					id="files-drawer-resize-button"
					resizeId="files-drawer-resize"
				/>
			</div>
		</Drawer>
	);
};
