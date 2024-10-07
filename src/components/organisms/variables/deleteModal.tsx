import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { ModalDeleteVariableProps } from "@interfaces/components";
import { useModalStore } from "@src/store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteVariableModal = ({ onDelete, variable }: ModalDeleteVariableProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteVariable" });
	const { closeModal } = useModalStore();

	return (
		<Modal hideCloseButton name={ModalName.deleteVariable}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>

				<div>
					<p>{t("content", { name: variable?.name })}</p>
					<p>{t("deleteWarning")}</p>
				</div>
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancelButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.deleteFile)}
					variant="outline"
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("deleteButton")}
					className="bg-gray-1100 px-4 py-3 font-semibold hover:text-error"
					onClick={onDelete}
					variant="filled"
				>
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};
