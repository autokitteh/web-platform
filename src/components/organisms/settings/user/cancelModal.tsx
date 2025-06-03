import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@src/enums";
import { useModalStore } from "@src/store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const CancelPlanModal = () => {
	const { t } = useTranslation("modals", { keyPrefix: "cancelPlan" });
	const { closeModal } = useModalStore();

	return (
		<Modal name={ModalName.cancelPlan}>
			<div className="mx-6">
				<h3 className="mb-5 font-averta text-xl font-bold">{t("title")}</h3>
				<p className="font-light">{t("line1")}</p>
				<p className="mt-1 font-light">{t("line2")}</p>
			</div>
			<div className="mt-14 flex justify-end gap-1">
				<Button
					ariaLabel={t("cancelButton")}
					className="w-auto px-4 py-3 font-semibold hover:text-white"
					onClick={() => closeModal(ModalName.cancelPlan)}
				>
					{t("cancelButton")}
				</Button>
				<Button
					ariaLabel={t("confirmButton")}
					className="w-auto px-4 py-3 font-semibold hover:bg-error"
					onClick={() => closeModal(ModalName.cancelPlan)}
					variant="filled"
				>
					{t("confirmButton")}
				</Button>
			</div>
		</Modal>
	);
};
