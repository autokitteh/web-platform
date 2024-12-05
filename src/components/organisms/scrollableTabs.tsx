import React, { useEffect, useRef, useState } from "react";

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

	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const activeTabRef = useRef<HTMLDivElement>(null);

	const activeEditorFileName = (projectId && openFiles[projectId]?.find(({ isActive }) => isActive)?.name) || "";

	const [showLeftIndicator, setShowLeftIndicator] = useState(false);
	const [showRightIndicator, setShowRightIndicator] = useState(false);

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

	useEffect(() => {
		if (scrollContainerRef.current && activeTabRef.current) {
			const observer = new IntersectionObserver(
				([entry]) => {
					const { boundingClientRect, rootBounds } = entry;

					setShowLeftIndicator(boundingClientRect.left < rootBounds!.left);
					setShowRightIndicator(boundingClientRect.right > rootBounds!.right);
				},
				{
					root: scrollContainerRef.current,
					threshold: 1,
				}
			);

			observer.observe(activeTabRef.current);

			return () => {
				observer.disconnect();
			};
		} else {
			setShowLeftIndicator(false);
			setShowRightIndicator(false);
		}
	}, [activeEditorFileName]);

	const renderDuplicateActiveTab = (position: "left" | "right") => (
		<div
			className={cn("sticky top-0 z-10 bg-black", {
				"left-0": position === "left",
				"-right-2": position === "right",
			})}
		>
			<Tab
				activeTab={activeEditorFileName}
				className="group relative flex items-center gap-1 p-2 normal-case"
				onClick={() => openFileAsActive(activeEditorFileName)}
				value={activeEditorFileName}
			>
				{activeEditorFileName}
				<IconButton
					ariaLabel={t("buttons.ariaCloseFile")}
					className={activeCloseIcon(activeEditorFileName)}
					onClick={(event) => handleCloseButtonClick(event, activeEditorFileName)}
				>
					<Close className="size-2 fill-white transition" />
				</IconButton>
			</Tab>
		</div>
	);

	return (
		<div className="overflow-x-auto">
			{showLeftIndicator ? renderDuplicateActiveTab("left") : null}
			<div
				className="scrollbar relative flex w-full select-none items-center gap-1 overflow-x-auto overflow-y-hidden whitespace-nowrap pr-2 uppercase xl:gap-2 2xl:gap-4 3xl:gap-5"
				ref={scrollContainerRef}
			>
				{projectId
					? openFiles[projectId]?.map(({ name }, index, array) => {
							const isActive = name === activeEditorFileName;

							return (
								<div key={name} ref={isActive ? activeTabRef : null}>
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

				{showRightIndicator ? renderDuplicateActiveTab("right") : null}
			</div>
		</div>
	);
};
