import React from "react";

import { MdFolderOpen } from "react-icons/md";
import { useParams } from "react-router-dom";

import { cn } from "@src/utilities";

import { useProjectFilesVisibility } from "@hooks";

import { Button } from "@components/atoms";

export const ShowProjectFilesButton = ({ className }: { className?: string }) => {
	const { projectId } = useParams();

	const { showFilesButton, handleShowProjectFiles } = useProjectFilesVisibility({ projectId });

	if (!projectId) return null;

	if (!showFilesButton) {
		return null;
	}

	const buttonClassName = cn("absolute left-2 top-2 z-10 rounded-lg fill-white stroke-white", className);

	return (
		<Button
			ariaLabel="Show Project Files"
			className={buttonClassName}
			data-testid="show-project-files-button-wrapper"
			id="show-project-files-button-wrapper"
			onClick={handleShowProjectFiles}
		>
			<MdFolderOpen className="size-5 fill-white" />
		</Button>
	);
};
