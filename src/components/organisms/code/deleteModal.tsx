import React from "react";

import { useTranslation } from "react-i18next";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { ModalName } from "@enums/components";
import { DeleteFile } from "@interfaces/components";
import { useModalStore } from "@store";

export const DeleteFileModal = ({ onDelete }: DeleteFile) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteFile" });
	const fileName = useModalStore((state) => state.data as string);
	const { closeModal } = useModalStore();

	return (
		<Modal name={ModalName.deleteFile}>
			<div className="mx-6">
				<h3 className="font-bold mb-5 text-xl">{t("title", { name: fileName })}</h3>

				<p>{t("line")}</p>
			</div>

			<div className="flex gap-1 justify-end mt-14">
				<Button
					ariaLabel={t("cancelButton")}
					className="font-semibold hover:text-white px-4 py-3 w-auto"
					onClick={() => closeModal(ModalName.deleteFile)}
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("deleteButton")}
					className="bg-gray-700 font-semibold px-4 py-3 w-auto"
					onClick={onDelete}
					variant="filled"
				>
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};
