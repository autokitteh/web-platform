import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { useModalStore } from "@src/store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteOrganizationModal = () => {
	const { t } = useTranslation("settings", { keyPrefix: "organization" });
	const { closeModal } = useModalStore();
	const organizationName = useModalStore((state) => state.data as string);

	return (
		<Modal hideCloseButton name={ModalName.deleteOrganization}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("modal.deleteOrganization", { name: organizationName })}?</h3>
				<p>{t("modal.line1")}</p>
				<p>{t("modal.line2")}</p>
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("modal.cancel")}
					className="bg-gray-1100 px-4 py-3 font-semibold"
					onClick={() => closeModal(ModalName.deleteOrganization)}
					variant="filled"
				>
					{t("modal.buttons.cancel")}
				</Button>

				<Button
					ariaLabel={t("modal.delete")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					variant="outline"
				>
					{t("modal.buttons.delete")}
				</Button>
			</div>
		</Modal>
	);
};
