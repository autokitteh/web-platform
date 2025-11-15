import React from "react";

import { Tree } from "react-arborist";

import { FileNode } from "./fileNode";
import { FileTreeProps } from "@interfaces/components";
import { ModalName } from "@src/enums";
import { useProjectValidationState } from "@src/hooks";
import { useModalStore } from "@src/store";

import { Button, FrontendProjectValidationIndicator } from "@components/atoms";

import { CirclePlusIcon, UploadIcon } from "@assets/image/icons";

export const FileTree = ({
	data,
	activeFilePath,
	onFileClick,
	onFileDelete,
	height,
	isUploadingFiles,
	handleFileSelect,
}: FileTreeProps) => {
	const { openModal } = useModalStore();
	const filesValidation = useProjectValidationState("resources");
	return (
		<>
			<div className="flex py-2">
				<Button
					ariaLabel="Create new file"
					className="group mr-4 !p-0 hover:bg-transparent hover:font-semibold"
					onClick={() => openModal(ModalName.addFile)}
				>
					<CirclePlusIcon className="size-4 stroke-green-800 stroke-[2] transition-all group-hover:stroke-[3]" />
					<span className="-ml-1 text-sm text-green-800 hover:underline">Create</span>
				</Button>
				<label
					aria-label="Import files"
					className="group flex cursor-pointer !p-0 hover:bg-transparent hover:font-semibold"
				>
					<input
						className="hidden"
						disabled={isUploadingFiles}
						multiple
						onChange={handleFileSelect}
						type="file"
					/>
					<UploadIcon className="size-4 stroke-green-800 stroke-[4] transition-all group-hover:stroke-[5]" />
					<span className="ml-1 text-sm text-green-800 hover:underline">Import</span>
				</label>
			</div>
			{data.length > 0 ? null : (
				<div className="-ml-0.5 mt-1.5 flex gap-1.5">
					{filesValidation?.level && filesValidation?.message ? (
						<FrontendProjectValidationIndicator
							level={filesValidation.level}
							message={filesValidation.message}
						/>
					) : null}
					<p className="text-sm text-gray-300">No files available</p>
				</div>
			)}
			<Tree data={data} height={height} indent={12} openByDefault={false} rowHeight={25} width="100%">
				{(props) => (
					<FileNode
						{...props}
						activeFilePath={activeFilePath}
						onFileClick={onFileClick}
						onFileDelete={onFileDelete}
					/>
				)}
			</Tree>
		</>
	);
};
