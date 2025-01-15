import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { DeleteOrganizationModalProps } from "@interfaces/components";

import { useModalStore } from "@store";

import { Button, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteOrganizationModal = ({ onDelete, isDeleting }: DeleteOrganizationModalProps) => {
	const { t } = useTranslation("setting", { keyPrefix: "organization" });
	const { closeModal } = useModalStore();
	const organization = useModalStore((state) => state.data) as { id: string; name: string };

	return (
		<Modal name={ModalName.deleteOrganization}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">
					{t("modal.deleteOrganization", { name: "Organization Name" })}?
				</h3>
				<p className="font-light">{t("line1", { name: organization?.name })}</p>
				<p className="mt-1 font-light">{t("line2")}</p>
			</div>

			<div className="mt-14 flex justify-end gap-1">
				<Button
					ariaLabel={t("modal.cancel")}
					className="w-auto px-4 py-3 font-semibold hover:text-white"
					onClick={() => closeModal(ModalName.deleteOrganization)}
				>
					{t("modal.buttons.cancel")}
				</Button>

				<Button
					ariaLabel={t("modal.delete")}
					className="w-auto px-4 py-3 font-semibold hover:bg-error"
					disabled={isDeleting}
					onClick={() => onDelete()}
				>
					{isDeleting ? <Loader size="sm" /> : null}
					{t("modal.buttons.delete")}
				</Button>
			</div>
		</Modal>
	);
};
