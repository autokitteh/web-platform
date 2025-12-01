import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { DeleteModalProps } from "@interfaces/components";

import { useModalStore } from "@store";

import { Button, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteGlobalConnectionModal = ({ isDeleting, onDelete }: DeleteModalProps) => {
	const { t } = useTranslation("connections", { keyPrefix: "deleteModal" });
	const { closeModal, getModalData } = useModalStore();

	const modalData = getModalData<{ id: string; name: string }>(ModalName.deleteGlobalConnection);
	const { name } = modalData || { id: "", name: "" };

	return (
		<Modal hideCloseButton name={ModalName.deleteGlobalConnection}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>
				<p>{t("content", { name })}</p>
				<p className="mt-2 text-sm text-gray-1100">{t("deleteWarning")}</p>
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancelButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.deleteGlobalConnection)}
					variant="outline"
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("okButton")}
					className="min-w-20 justify-center bg-gray-1100 px-4 py-3 font-semibold hover:text-error"
					disabled={isDeleting}
					onClick={onDelete}
					variant="filled"
				>
					{isDeleting ? (
						<div className="flex flex-row gap-2">
							<Loader size="sm" />
							{t("okButton")}
						</div>
					) : (
						t("okButton")
					)}
				</Button>
			</div>
		</Modal>
	);
};
