import React from "react";

import { Trans, useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { ModalDeleteVariableProps } from "@interfaces/components";
import { useModalStore } from "@store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteVariableModal = ({ onDelete, variable }: ModalDeleteVariableProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteVariable" });
	const { closeModal } = useModalStore();

	return (
		<Modal name={ModalName.deleteVariable}>
			<div className="mx-6">
				<h3 className="font-bold mb-5 text-xl">{t("title")}</h3>

				<p>{t("line")}</p>

				<div className="font-medium">
					<Trans i18nKey="line2" t={t} values={{ name: variable?.name, value: variable?.value }} />
				</div>

				<p>{t("line3")}</p>

				<p>{t("line4")}</p>
			</div>

			<div className="flex gap-1 justify-end mt-14">
				<Button
					ariaLabel={t("cancelButton")}
					className="font-semibold hover:text-white px-4 py-3 w-auto"
					onClick={() => closeModal(ModalName.deleteVariable)}
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("deleteButton")}
					className="bg-gray-700 font-semibold px-4 py-3 w-auto"
					onClick={onDelete}
					variant="filled"
				>
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};
