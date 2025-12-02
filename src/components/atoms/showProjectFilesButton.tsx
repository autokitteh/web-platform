import React from "react";

import { MdFolderOpen } from "react-icons/md";

import { cn } from "@src/utilities";

import { useProjectFilesVisibility } from "@hooks";

import { Button } from "@components/atoms";

export const ShowProjectFilesButton = ({ className }: { className?: string }) => {
	const { showFilesButton, handleShowProjectFiles } = useProjectFilesVisibility();

	if (!showFilesButton) {
		return null;
	}

	const buttonClassName = cn("rounded-lg", className);

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
