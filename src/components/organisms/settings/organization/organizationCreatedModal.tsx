import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { useModalStore } from "@src/store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const OrganizationCreatedModal = () => {
	const { t } = useTranslation("settings", { keyPrefix: "organization.modal" });
	const { closeModal } = useModalStore();
	const data = useModalStore((state) => state.data) as { orgName: string };

	if (!data) return null;

	return (
		<Modal hideCloseButton name={ModalName.organizationCreated}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("organizationCreated", { name: data.orgName })}</h3>
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("buttons.stayOn")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.organizationCreated)}
					variant="outline"
				>
					{t("buttons.stayOn")}: Current Org
				</Button>

				<Button ariaLabel={t("buttons.open")} className="bg-gray-1100 px-4 py-3 font-semibold" variant="filled">
					{t("buttons.open")}: {data.orgName}
				</Button>
			</div>
		</Modal>
	);
};
