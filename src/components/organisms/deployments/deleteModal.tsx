import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { ModalName } from "@enums/components";
import { ModalDeleteDeploymentProps } from "@interfaces/components";
import { useModalStore } from "@store";
import React from "react";
import { useTranslation } from "react-i18next";

export const DeleteDeploymentModal = ({ onDelete }: ModalDeleteDeploymentProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteDeployment" });
	const { closeModal } = useModalStore();

	return (
		<Modal name={ModalName.deleteDeployment}>
			<div className="mx-6">
				<h3 className="font-bold mb-5 text-xl">{t("title")}</h3>

				<p>{t("line")}</p>
			</div>

			<div className="flex gap-1 justify-end mt-10">
				<Button
					ariaLabel={t("cancelButton")}
					className="font-semibold hover:text-white px-4 py-3 w-auto"
					onClick={() => closeModal(ModalName.deleteDeployment)}
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
