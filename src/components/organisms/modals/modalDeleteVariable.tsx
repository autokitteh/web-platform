import React from "react";
import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { EModalName } from "@enums/components";
import { IModalDeleteVariable } from "@interfaces/components";
import { useModalStore, useProjectStore } from "@store";
import { useTranslation, Trans } from "react-i18next";

export const ModalDeleteVariable = ({ onDelete }: IModalDeleteVariable) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteVariable" });
	const {
		currentProject: { variables },
	} = useProjectStore();
	const { itemId: index, closeModal } = useModalStore();

	return (
		<Modal name={EModalName.deleteVariable}>
			<div className="mx-6">
				<h3 className="text-xl font-bold mb-5">{t("title")}</h3>
				<p>{t("line")}</p>
				<p className="font-medium">
					<Trans>
						{t("line2", {
							name: `<strong>${variables[Number(index)]?.name}</strong><br/>`,
							value: `<strong>${variables[Number(index)]?.value}</strong>`,
						})}
					</Trans>
				</p>
				<p>{t("line3")}</p>
				<p>{t("line4")}</p>
			</div>
			<div className="flex justify-end gap-1 mt-14">
				<Button
					className="font-semibold py-3 px-4 hover:text-white w-auto"
					onClick={() => closeModal(EModalName.deleteVariable)}
				>
					{t("cancelButton")}
				</Button>
				<Button className="font-semibold py-3 px-4 bg-gray-700 w-auto" onClick={onDelete} variant="filled">
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};
