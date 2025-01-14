import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { DeleteMemberModalProps } from "@interfaces/components";

import { useModalStore } from "@store";

import { Button, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteMemberModal = ({ onDelete, isDeleting }: DeleteMemberModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteOrgMember" });
	const { closeModal } = useModalStore();
	const userData = useModalStore((state) => state.data) as { email: string; id: string; name: string };

	return (
		<Modal name={ModalName.deleteMemberFromOrg}>
			<div className="mx-6">
				<h3 className="mb-5 font-averta text-xl font-bold">{t("deleteMember")}</h3>

				<p className="font-light">{t("line1", { name: userData?.name, email: userData?.email })}</p>
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
					disabled={isDeleting}
					onClick={() => onDelete(userData?.id, userData?.email)}
					variant="filled"
				>
					{isDeleting ? <Loader size="sm" /> : null}
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};
