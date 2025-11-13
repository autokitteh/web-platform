import React from "react";

import { Tree } from "react-arborist";

import { FileNode } from "./fileNode";
import { fileTreeClasses } from "@constants/components/files.constants";
import { FileTreeProps } from "@interfaces/components";
import { ModalName } from "@src/enums";
import { useProjectValidationState } from "@src/hooks";
import { useModalStore } from "@src/store";

import { Button, FrontendProjectValidationIndicator } from "@components/atoms";
import { DropdownButton } from "@components/molecules";

import { CirclePlusIcon, UploadIcon } from "@assets/image/icons";

export const FileTree = ({
	activeFilePath,
	data,
	handleFileSelect,
	height,
	isUploadingFiles,
	onFileClick,
	onFileDelete,
	onFileRename,
}: FileTreeProps) => {
	const { openModal } = useModalStore();
	const filesValidation = useProjectValidationState("resources");
	return (
		<>
			<div className={fileTreeClasses.container}>
				<DropdownButton
					contentMenu={
						<>
							<Button
								ariaLabel="Create new file"
								className={fileTreeClasses.dropdown}
								onClick={() => openModal(ModalName.addFile)}
							>
								Create File
							</Button>
							<Button
								ariaLabel="Create new directory"
								className={fileTreeClasses.createButton}
								onClick={() => openModal(ModalName.addDirectory)}
							>
								Create Directory
							</Button>
							<Button onClick={() => {}}>
								<label aria-label="Import files" className={fileTreeClasses.importLabel}>
									<input
										className="hidden"
										disabled={isUploadingFiles}
										multiple
										onChange={handleFileSelect}
										type="file"
									/>
									<UploadIcon className={fileTreeClasses.uploadIcon} />
									<span className={fileTreeClasses.importText}>Import</span>
								</label>
							</Button>
						</>
					}
				>
					<Button
						ariaLabel="Create new file"
						className={fileTreeClasses.mainButton}
						onClick={() => openModal(ModalName.addFile)}
					>
						<CirclePlusIcon className={fileTreeClasses.createIcon} />
						<span className={fileTreeClasses.createText}>Create</span>
					</Button>
				</DropdownButton>
			</div>
			{data.length > 0 ? null : (
				<div className={fileTreeClasses.emptyStateContainer}>
					{filesValidation?.level && filesValidation?.message ? (
						<FrontendProjectValidationIndicator
							level={filesValidation.level}
							message={filesValidation.message}
						/>
					) : null}
					<p className={fileTreeClasses.emptyStateText}>No files available</p>
				</div>
			)}
			<Tree data={data} height={height} indent={12} openByDefault={false} rowHeight={25} width="100%">
				{(props) => (
					<FileNode
						{...props}
						activeFilePath={activeFilePath}
						onFileClick={onFileClick}
						onFileDelete={onFileDelete}
						onFileRename={onFileRename}
					/>
				)}
			</Tree>
		</>
	);
};
