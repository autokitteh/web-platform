import React from "react";
import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { ModalName } from "@enums/components";
import { ModalDeleteVariableProps } from "@interfaces/components";
import { useModalStore } from "@store";
import { useTranslation, Trans } from "react-i18next";

export const DeleteVariableModal = ({ onDelete, variable }: ModalDeleteVariableProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteVariable" });
	const { closeModal } = useModalStore();

	return (
		<Modal name={ModalName.deleteVariable}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>
				<p>{t("line")}</p>
				<div className="font-medium">
					<Trans i18nKey="line2" t={t} values={{ name: variable?.name, value: variable?.value }} />
				</div>
				<p>{t("line3")}</p>
				<p>{t("line4")}</p>
			</div>
			<div className="flex justify-end gap-1 mt-14">
				<Button
					ariaLabel={t("cancelButton")}
					className="w-auto px-4 py-3 font-semibold hover:text-white"
					onClick={() => closeModal(ModalName.deleteVariable)}
				>
					{t("cancelButton")}
				</Button>
				<Button
					ariaLabel={t("deleteButton")}
					className="w-auto px-4 py-3 font-semibold bg-gray-700"
					onClick={onDelete}
					variant="filled"
				>
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};
