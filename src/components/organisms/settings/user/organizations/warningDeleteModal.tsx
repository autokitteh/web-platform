import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";

import { useModalStore } from "@store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const WarningDeleteOrganizationModal = () => {
	const { t } = useTranslation("settings", { keyPrefix: "organization.modal" });
	const { closeModal } = useModalStore();
	const organization = useModalStore((state) => state.data) as { name: string };

	if (!organization) return null;

	return (
		<Modal name={ModalName.warningDeleteOrganization}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("warning")}</h3>
				<p className="font-light">{t("organizationDeleteWarning", { name: organization.name })}</p>
			</div>

			<div className="mt-14 flex justify-end gap-1">
				<Button
					ariaLabel={t("buttons.close")}
					className="w-auto px-4 py-3 font-semibold hover:text-white"
					onClick={() => closeModal(ModalName.warningDeleteOrganization)}
				>
					{t("buttons.close")}
				</Button>
			</div>
		</Modal>
	);
};
