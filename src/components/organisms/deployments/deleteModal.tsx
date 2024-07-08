import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { ModalDeleteDeploymentProps } from "@interfaces/components";
import { useModalStore } from "@store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteDeploymentModal = ({ onDelete }: ModalDeleteDeploymentProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteDeployment" });
	const { closeModal } = useModalStore();

	return (
		<Modal name={ModalName.deleteDeployment}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>

				<p>{t("line")}</p>
			</div>

			<div className="mt-10 flex justify-end gap-1">
				<Button
					ariaLabel={t("cancelButton")}
					className="w-auto px-4 py-3 font-semibold hover:text-white"
					onClick={() => closeModal(ModalName.deleteDeployment)}
				>
					{t("cancelButton")}
				</Button>

				<Button ariaLabel={t("deleteButton")} className="w-auto bg-gray-700 px-4 py-3 font-semibold" onClick={onDelete} variant="filled">
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};
