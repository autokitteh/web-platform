import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { useModal } from "@hooks/useModal";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const ActiveDeploymentWarningModal: React.FC = () => {
	const { t } = useTranslation("modals", { keyPrefix: "warningActiveDeployment" });
	const { getModalData, closeModal } = useModal();
	const data = getModalData(ModalName.warningDeploymentActive);
	if (!data) return null;

	const { action, modifiedId, goToAdd, goToEdit } = data;
	const onOkClick = () => (action === "edit" ? goToEdit(modifiedId) : goToAdd());

	return (
		<Modal hideCloseButton name={ModalName.warningDeploymentActive}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>

				<p className="text-base">{t("content")}</p>
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancelButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.warningDeploymentActive)}
					variant="outline"
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("agreeButton")}
					className="min-w-20 justify-center bg-gray-1100 px-4 py-3 font-semibold"
					onClick={onOkClick}
					variant="filled"
				>
					{t("agreeButton")}
				</Button>
			</div>
		</Modal>
	);
};
