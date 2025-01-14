import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ModalName } from "@enums/components";
import { useModalStore, useOrganizationStore } from "@src/store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const OrganizationPostCreationModal = () => {
	const { t } = useTranslation("settings", { keyPrefix: "organization.modal" });
	const { closeModal } = useModalStore();
	const data = useModalStore((state) => state.data) as { name: string };
	const navigate = useNavigate();
	const { currentOrganization } = useOrganizationStore();

	if (!data) return null;

	return (
		<Modal hideCloseButton name={ModalName.organizationCreated}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("organizationCreated", { name: data.name })}</h3>
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("buttons.stay")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.organizationCreated)}
					variant="outline"
				>
					{t("buttons.stay")}
				</Button>

				<Button
					ariaLabel={t("buttons.open")}
					className="bg-gray-1100 px-4 py-3 font-semibold"
					onClick={() => navigate(`/organization-settings/switch/${currentOrganization?.id}`)}
					variant="filled"
				>
					{t("buttons.open", { name: data.name })}
				</Button>
			</div>
		</Modal>
	);
};
