import React from "react";
import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { EModalName } from "@enums/components";
import { IModalDeleteVariable } from "@interfaces/components";
import { useModalStore } from "@store";
import { TVariable } from "@type/models";
import { useTranslation, Trans } from "react-i18next";

export const ModalDeleteVariable = ({ onDelete }: IModalDeleteVariable) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteVariable" });
	const data = useModalStore((state) => state.data as Omit<TVariable, "envId" | "isSecret">);
	const { closeModal } = useModalStore();

	return (
		<Modal name={EModalName.deleteVariable}>
			<div className="mx-6">
				<h3 className="text-xl font-bold mb-5">{t("title")}</h3>
				<p>{t("line")}</p>
				<p className="font-medium">
					<Trans>
						{t("line2", {
							name: `<strong>${data?.name}</strong><br/>`,
							value: `<strong>${data?.value}</strong>`,
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
