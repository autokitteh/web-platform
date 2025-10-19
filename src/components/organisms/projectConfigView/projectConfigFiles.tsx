import React, { useCallback, useMemo } from "react";

import { orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { useFileStore, useModalStore, useSharedBetweenProjectsStore } from "@src/store";
import { cn } from "@utilities";

import { Button, IconSvg } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { CirclePlusIcon, TrashIcon, VariableCircleIcon } from "@assets/image/icons";
import { FileIcon } from "@assets/image/icons/sidebar";

export const ProjectConfigFiles = () => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "files" });
	const { projectId } = useParams() as { projectId: string };
	const {
		fileList: { list },
		openFileAsActive,
		openFiles,
	} = useFileStore();
	const { setFullScreenEditor, fullScreenEditor } = useSharedBetweenProjectsStore();
	const { openModal } = useModalStore();

	const sortedFiles = useMemo(() => orderBy(list, (name) => name, "asc"), [list]);

	const handleFileClick = (fileName: string) => {
		openFileAsActive(fileName);
		if (!fullScreenEditor[projectId]) {
			setFullScreenEditor(projectId, true);
		}
	};

	const handleDeleteFile = useCallback(
		(fileName: string) => {
			openModal(ModalName.deleteFile, fileName);
		},
		[openModal]
	);

	const handleAddFile = useCallback(() => {
		openModal(ModalName.addCodeAssets);
	}, [openModal]);

	const isActiveFile = (fileName: string) => {
		return openFiles[projectId]?.find(({ isActive, name }) => name === fileName && isActive);
	};

	return sortedFiles?.filter((fileName) => fileName !== "README.md").length > 0 ? (
		<Accordion
			closeIcon={VariableCircleIcon}
			hideDivider
			openIcon={VariableCircleIcon}
			title={`${t("title")} (${sortedFiles?.filter((fileName) => fileName !== "README.md").length})`}
		>
			<div className="space-y-2">
				{sortedFiles
					?.filter((fileName) => fileName !== "README.md")
					.map((fileName: string) => (
						<div className="flex flex-row items-center gap-1" key={fileName}>
							<button
								className={cn(
									"flex w-4/5 flex-row items-center gap-1 rounded-lg p-2 text-left transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-800",
									{
										"bg-gray-1100": isActiveFile(fileName),
									}
								)}
								key={fileName}
								onClick={() => handleFileClick(fileName)}
								tabIndex={0}
								type="button"
							>
								<IconSvg className="size-4 fill-gray-400" src={FileIcon} />
								<div className="min-w-0 flex-1">
									<div className="truncate text-sm font-medium text-white">{fileName}</div>
								</div>
							</button>
							<button
								className="flex w-1/5 items-center justify-center rounded-lg p-2 transition-colors hover:bg-gray-800"
								onClick={() => handleDeleteFile(fileName)}
								type="button"
							>
								<TrashIcon className="size-4 stroke-white hover:stroke-red-500" />
							</button>
						</div>
					))}
				<div className="flex w-full justify-end">
					<Button
						ariaLabel="Add File"
						className="group !p-0 hover:bg-transparent hover:font-semibold"
						onClick={handleAddFile}
					>
						<CirclePlusIcon className="size-3 stroke-green-800 stroke-[1.225] transition-all group-hover:stroke-[2]" />
						<span className="text-sm text-green-800">Add</span>
					</Button>
				</div>
			</div>
		</Accordion>
	) : (
		<div className="flex w-full justify-between">
			<div className="text-sm text-gray-400">{t("noFilesFound")}</div>
			<Button
				ariaLabel="Add File"
				className="group !p-0 hover:bg-transparent hover:font-semibold"
				onClick={handleAddFile}
			>
				<CirclePlusIcon className="size-3 stroke-green-800 stroke-[1.225] transition-all group-hover:stroke-[2]" />
			</Button>
		</div>
	);
};
