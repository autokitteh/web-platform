import React from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useFileOperations } from "@src/hooks";
import { cn } from "@utilities";

import { IconButton, Tab } from "@components/atoms";

import { Close } from "@assets/image/icons";

export const ScrollableTabs = ({ isExpanded, onExpand }: { isExpanded: boolean; onExpand: () => void }) => {
	const { t } = useTranslation("tabs", { keyPrefix: "editor" });
	const { projectId } = useParams();
	const { closeOpenedFile, openFileAsActive, openFiles } = useFileOperations(projectId!);

	const activeEditorFileName = (projectId && openFiles[projectId]?.find(({ isActive }) => isActive)?.name) || "";

	const activeCloseIcon = (fileName: string) => {
		const isActiveFile = openFiles[projectId!].find(({ isActive, name }) => name === fileName && isActive);

		return cn("h-4 w-4 p-0.5 hover:bg-gray-1100 hidden", {
			flex: isActiveFile,
		});
	};

	const handleCloseButtonClick = (
		event: React.MouseEvent<HTMLButtonElement | HTMLDivElement, MouseEvent>,
		name: string
	): void => {
		event.stopPropagation();
		closeOpenedFile(name);

		if (isExpanded && openFiles[projectId!]?.length === 1) {
			onExpand();
		}
	};

	return (
		<div className="scrollbar relative mr-2 flex w-full select-none items-center gap-1 overflow-x-auto overflow-y-hidden whitespace-nowrap uppercase xl:gap-2 2xl:gap-4 3xl:gap-5">
			{projectId
				? openFiles[projectId]?.map(({ name }, index, array) => {
						const isActive = name === activeEditorFileName;

						return (
							<div
								className={cn("h-16 flex items-center", {
									"sticky top-0 z-20 bg-black before:absolute before:top-0 before:h-full before:w-3 before:bg-black left-0 right-0":
										isActive,
								})}
								key={name}
							>
								<Tab
									activeTab={activeEditorFileName}
									className="group relative flex items-center gap-1 normal-case"
									onClick={() => openFileAsActive(name)}
									value={name}
								>
									{name}
									{index !== array.length - 1 ? (
										<div className="absolute -right-0.5 top-0 h-3/4 w-px bg-gray-950 xl:-right-1 2xl:-right-2 3xl:-right-2.5" />
									) : null}
									<IconButton
										ariaLabel={t("buttons.ariaCloseFile")}
										className={activeCloseIcon(name)}
										onClick={(event) => handleCloseButtonClick(event, name)}
									>
										<Close className="size-2 fill-white transition" />
									</IconButton>
								</Tab>
							</div>
						);
					})
				: null}
		</div>
	);
};
