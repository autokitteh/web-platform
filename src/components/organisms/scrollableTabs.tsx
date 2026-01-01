import React from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useSticky } from "@src/hooks";
import { useFileStore } from "@src/store";
import { abbreviateFilePath, cn } from "@utilities";

import { IconButton, Tab } from "@components/atoms";

import { Close } from "@assets/image/icons";

interface ScrollableTabsProps {
	onTabContextMenu?: (event: React.MouseEvent<HTMLDivElement>, fileName: string) => void;
}

export const ScrollableTabs = ({ onTabContextMenu }: ScrollableTabsProps) => {
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const { projectId } = useParams();
	const { closeOpenedFile, openFileAsActive, openFiles } = useFileStore();

	const { ref: activeTabRef } = useSticky();
	const activeEditorFileName = (projectId && openFiles[projectId]?.find(({ isActive }) => isActive)?.name) || "";

	const activeCloseIcon = (fileName: string) => {
		const isActiveFile = openFiles[projectId!]?.find(({ isActive, name }) => name === fileName && isActive);

		return cn("size-4 p-0.5 opacity-50 hover:bg-gray-1100 group-hover:opacity-100", {
			"opacity-100": isActiveFile,
		});
	};

	const handleCloseButtonClick = (
		event: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>,
		name: string
	): void => {
		event.stopPropagation();
		closeOpenedFile(name);
	};

	return (
		<div className="scrollbar relative flex w-full select-none items-center gap-1 overflow-x-auto overflow-y-hidden whitespace-nowrap uppercase xl:gap-2 2xl:gap-4 3xl:gap-5">
			{projectId
				? openFiles[projectId]?.map(({ name }) => {
						const isActive = name === activeEditorFileName;

						return (
							<div
								className={cn("flex h-8 items-center", {
									"sticky left-0 right-0 top-0 z-popover px-3 bg-black before:absolute before:left-0 before:top-0 before:h-full before:w-3 before:bg-black after:absolute after:right-0 after:top-0 after:h-full after:w-3 after:bg-black":
										isActive,
								})}
								key={name}
								onContextMenu={(e) => onTabContextMenu?.(e, name)}
								ref={isActive ? activeTabRef : null}
							>
								<Tab
									activeTab={activeEditorFileName}
									className="group flex items-center gap-1 bg-black normal-case"
									onClick={() => openFileAsActive(name)}
									title={name}
									value={name}
								>
									{abbreviateFilePath(name)}

									<IconButton
										ariaLabel={t("buttons.ariaCloseFile")}
										className={activeCloseIcon(name)}
										onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
											handleCloseButtonClick(event, name)
										}
									>
										<Close className="size-3 fill-gray-750 transition group-hover:fill-white" />
									</IconButton>
								</Tab>
							</div>
						);
					})
				: null}
		</div>
	);
};
