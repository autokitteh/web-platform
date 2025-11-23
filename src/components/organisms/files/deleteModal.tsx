import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { DeleteModalProps, DeleteFileModalData } from "@interfaces/components";

import { useModalStore } from "@store";

import { Button, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteFileModal = ({ isDeleting, onDelete }: DeleteModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteFile" });
	const modalData = useModalStore((state) => state.data) as DeleteFileModalData | string;
	const { closeModal } = useModalStore();

	const fileName = typeof modalData === "string" ? modalData : modalData?.name || "";
	const isDirectory = typeof modalData === "object" && modalData?.isDirectory;
	const fileCount = typeof modalData === "object" ? modalData?.fileCount : 0;

	const typeLabel = isDirectory ? t("directory") : t("file");

	return (
		<Modal hideCloseButton name={ModalName.deleteFile}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title", { type: typeLabel })}</h3>

				<p>{t("content", { name: fileName })}</p>

				{isDirectory && fileCount ? (
					<p>{t("deleteDirectoryWarning", { count: fileCount })}</p>
				) : (
					<p>{t("deleteWarning")}</p>
				)}
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancelButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.deleteFile)}
					variant="outline"
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("deleteButton")}
					className="bg-gray-1100 px-4 py-3 font-semibold hover:text-error"
					disabled={isDeleting}
					onClick={onDelete}
					variant="filled"
				>
					{isDeleting ? (
						<div className="flex flex-row gap-2">
							<Loader size="sm" />
							{t("deleteButton")}
						</div>
					) : (
						t("deleteButton")
					)}
				</Button>
			</div>
		</Modal>
	);
};
