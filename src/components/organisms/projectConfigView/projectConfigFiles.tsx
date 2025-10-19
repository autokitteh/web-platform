import React, { useMemo } from "react";

import { orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useFileStore, useSharedBetweenProjectsStore } from "@src/store";
import { cn } from "@utilities";

import { IconSvg } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { VariableCircleIcon } from "@assets/image/icons";
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

	const sortedFiles = useMemo(() => orderBy(list, (name) => name, "asc"), [list]);

	const handleFileClick = (fileName: string) => {
		openFileAsActive(fileName);
		if (!fullScreenEditor[projectId]) {
			setFullScreenEditor(projectId, true);
		}
	};

	const isActiveFile = (fileName: string) => {
		return openFiles[projectId]?.find(({ isActive, name }) => name === fileName && isActive);
	};

	return (
		<Accordion
			closeIcon={VariableCircleIcon}
			hideDivider
			openIcon={VariableCircleIcon}
			title={`${t("title")} (${sortedFiles.length})`}
		>
			<div className="space-y-1">
				{sortedFiles && sortedFiles.length > 0 ? (
					sortedFiles.map((fileName) => (
						<button
							className={cn(
								"flex w-full flex-row items-center gap-1 rounded-lg p-2 text-left transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-800",
								{
									"bg-gray-800 border-gray-600": isActiveFile(fileName),
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
					))
				) : (
					<div className="text-sm text-gray-400">{t("noFilesFound")}</div>
				)}
			</div>
		</Accordion>
	);
};
