import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { WarningDeploymentActivetedModalProps } from "@interfaces/components";
import { useModalStore } from "@src/store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const WarningDeploymentActivetedModal = ({ onClick }: WarningDeploymentActivetedModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "warningActiveDeployment" });
	const { closeModal } = useModalStore();

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
					className="bg-gray-1100 px-4 py-3 font-semibold"
					onClick={onClick}
					variant="filled"
				>
					{t("agreeButton")}
				</Button>
			</div>
		</Modal>
	);
};
