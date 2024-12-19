import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { useModalStore } from "@src/store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const CreatedOrganizationModal = () => {
	const { t } = useTranslation("settings", { keyPrefix: "organization" });
	const { closeModal } = useModalStore();

	return (
		<Modal hideCloseButton name={ModalName.createdNewOrganization}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("modal.organizationCreated", { name: "XXXX" })}</h3>
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("modal.stayOn")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.createdNewOrganization)}
					variant="outline"
				>
					{t("modal.stayOn")}: Current Org
				</Button>

				<Button ariaLabel={t("modal.open")} className="bg-gray-1100 px-4 py-3 font-semibold" variant="filled">
					{t("modal.open")}: New Org
				</Button>
			</div>
		</Modal>
	);
};
