import React from "react";
import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { EModalName } from "@enums/components";
import { DeleteFile } from "@interfaces/components";
import { useModalStore } from "@store";
import { useTranslation } from "react-i18next";

export const ModalDeleteFile = ({ onDelete }: DeleteFile) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteFile" });
	const fileName = useModalStore((state) => state.data as string);
	const { closeModal } = useModalStore();

	return (
		<Modal name={EModalName.deleteFile}>
			<div className="mx-6">
				<h3 className="text-xl font-bold mb-5">{t("title", { name: fileName })}</h3>
				<p>{t("line")}</p>
			</div>
			<div className="flex justify-end gap-1 mt-14">
				<Button
					ariaLabel={t("cancelButton")}
					className="font-semibold py-3 px-4 hover:text-white w-auto"
					onClick={() => closeModal(EModalName.deleteFile)}
				>
					{t("cancelButton")}
				</Button>
				<Button
					ariaLabel={t("deleteButton")}
					className="font-semibold py-3 px-4 bg-gray-700 w-auto"
					onClick={onDelete}
					variant="filled"
				>
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};
