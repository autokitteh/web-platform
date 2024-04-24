import React from "react";
import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { EModalName } from "@enums/components";
import { ModalDeleteVariableProps } from "@interfaces/components";
import { useModalStore } from "@store";
import { useTranslation, Trans } from "react-i18next";

export const ModalDeleteVariable = ({ onDelete, variable }: ModalDeleteVariableProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteVariable" });
	const { closeModal } = useModalStore();

	return (
		<Modal name={EModalName.deleteVariable}>
			<div className="mx-6">
				<h3 className="text-xl font-bold mb-5">{t("title")}</h3>
				<p>{t("line")}</p>
				<p className="font-medium">
					<Trans>
						{t("line2", {
							name: `<strong>${variable?.name}</strong><br/>`,
							value: `<strong>${variable?.value}</strong>`,
						})}
					</Trans>
				</p>
				<p>{t("line3")}</p>
				<p>{t("line4")}</p>
			</div>
			<div className="flex justify-end gap-1 mt-14">
				<Button
					ariaLabel={t("cancelButton")}
					className="font-semibold py-3 px-4 hover:text-white w-auto"
					onClick={() => closeModal(EModalName.deleteVariable)}
				>
					{t("cancelButton")}
				</Button>
				<Button
					ariaLabel={t("deleteButton")}
					className="font-semibold py-3 px-4 bg-gray-700 w-auto"
					onClick={onDelete}
					variant="filled"
				>
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};
