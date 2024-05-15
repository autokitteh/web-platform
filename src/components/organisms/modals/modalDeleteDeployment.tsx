import React from "react";
import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { ModalName } from "@enums/components";
import { ModalDeleteDeploymentProps } from "@interfaces/components";
import { useModalStore } from "@store";
import { useTranslation } from "react-i18next";

export const ModalDeleteDeployment = ({ onDelete }: ModalDeleteDeploymentProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteDeployment" });
	const { closeModal } = useModalStore();

	return (
		<Modal name={ModalName.deleteDeployment}>
			<div className="mx-6">
				<h3 className="text-xl font-bold mb-5">{t("title")}</h3>
				<p>{t("line")}</p>
			</div>
			<div className="flex justify-end gap-1 mt-10">
				<Button
					ariaLabel={t("cancelButton")}
					className="font-semibold py-3 px-4 hover:text-white w-auto"
					onClick={() => closeModal(ModalName.deleteDeployment)}
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
