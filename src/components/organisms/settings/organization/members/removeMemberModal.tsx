import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { RemoveMemberModalProps } from "@interfaces/components";

import { useModalStore } from "@store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const RemoveMemberModal = ({ onRemove }: RemoveMemberModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteOrgMember" });
	const { closeModal } = useModalStore();
	const userData = useModalStore((state) => state.data as { email: string; userId: string });

	return (
		<Modal name={ModalName.deleteMemberFromOrg}>
			<div className="mx-6">
				<h3 className="mb-5 font-averta text-xl font-bold">{t("deleteMember")}</h3>

				<p className="font-light">{t("line1", { memberName: name })}</p>
				<p className="mt-1 font-light">{t("line2")}</p>
			</div>

			<div className="mt-14 flex justify-end gap-1">
				<Button
					ariaLabel={t("cancelButton")}
					className="w-auto px-4 py-3 font-semibold hover:text-white"
					onClick={() => closeModal(ModalName.deleteMemberFromOrg)}
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("deleteButton")}
					className="w-auto px-4 py-3 font-semibold hover:bg-error"
					onClick={() => onRemove(userData?.userId, userData?.email)}
					variant="filled"
				>
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};
