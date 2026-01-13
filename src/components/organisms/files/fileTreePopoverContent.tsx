import React from "react";

import { useTranslation } from "react-i18next";

import { usePopoverContext } from "@src/contexts";
import { ModalName } from "@src/enums";
import { useModalStore } from "@src/store";

import { Button } from "@components/atoms";
import { PopoverContent } from "@components/molecules/popover";

import { PlusIcon, UploadIcon } from "@assets/image/icons";

interface FileTreePopoverContentProps {
	handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
	isUploadingFiles: boolean;
}

export const FileTreePopoverContent = ({ handleFileSelect, isUploadingFiles }: FileTreePopoverContentProps) => {
	const { t } = useTranslation("files");
	const { openModal } = useModalStore();
	const popover = usePopoverContext();

	const handleAddFileClick = () => {
		openModal(ModalName.addFile);
		popover.close();
	};

	const handleAddDirectoryClick = () => {
		openModal(ModalName.addDirectory);
		popover.close();
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFileSelect(e);
		popover.close();
	};

	return (
		<PopoverContent className="flex min-w-44 flex-col gap-1 rounded-lg border-0.5 border-white bg-gray-1250 p-3">
			<Button
				ariaLabel="Create new file"
				className="group py-2 text-sm text-white hover:text-green-800 hover:underline"
				onClick={handleAddFileClick}
			>
				<PlusIcon className="size-4 fill-white group-hover:fill-green-800" />
				{t("createFile")}
			</Button>
			<Button
				ariaLabel="Create new directory"
				className="group py-2 text-sm text-white hover:text-green-800 hover:underline"
				onClick={handleAddDirectoryClick}
			>
				<PlusIcon className="size-4 fill-white group-hover:fill-green-800" />
				{t("createDirectory")}
			</Button>
			<label
				aria-label="Import files"
				className="group flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 text-sm text-white transition-colors hover:text-green-800 hover:underline"
			>
				<input
					className="hidden"
					disabled={isUploadingFiles}
					multiple
					onChange={handleFileInputChange}
					type="file"
				/>
				<UploadIcon className="size-4 stroke-white stroke-[4] transition-all group-hover:stroke-green-800" />
				<span className="text-sm text-white transition-colors group-hover:text-green-800">{t("import")}</span>
			</label>
		</PopoverContent>
	);
};
