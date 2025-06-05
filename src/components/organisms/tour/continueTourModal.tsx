import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { useModal } from "@hooks/useModal";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const ContinueTourModal: React.FC = () => {
	const { t } = useTranslation("modals", { keyPrefix: "continueTour" });
	const { getModalData, closeModal } = useModal();
	const data = getModalData(ModalName.continueTour);
	if (!data) return null;

	return (
		<Modal name={ModalName.continueTour}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title", { name: data?.name })}</h3>
				<p>{t("content")}</p>
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
			<Button
				ariaLabel={t("cancelButton")}
				className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
				onClick={() => { data.onCancel(); closeModal(ModalName.continueTour); }}
				variant="outline"
			>
				{t("cancelButton")}
			</Button>

			<Button
				ariaLabel={t("okButton")}
				className="min-w-20 justify-center bg-gray-1100 px-4 py-3 font-semibold hover:text-green-800"
				onClick={() => { data.onContinue(); closeModal(ModalName.continueTour); }}
				variant="filled"
			>
				{t("continueButton")}
			</Button>
			</div>
		</Modal>
	);
};
