import React from "react";
import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { ModalName } from "@enums/components";
import { useModalStore } from "@store";
import { useTranslation } from "react-i18next";

export const ModalDeleteConnection = () => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteConnection" });
	const { closeModal } = useModalStore();
	const handleCloseModal = () => closeModal(ModalName.deleteConnection);

	return (
		<Modal name={ModalName.deleteConnection}>
			<div className="mx-6">
				<h3 className="text-xl font-bold mb-5">{t("title")}</h3>
				<p>
					{t("line")}
					<br />
					<strong> {t("line2", { projects: 3, running: 2 })}</strong>
				</p>
				<br />
				<p>
					{t("line3")} <br /> {t("line4")}
				</p>
			</div>
			<div className="flex justify-end gap-1 mt-14">
				<Button className="font-semibold py-3 px-4 hover:text-white w-auto" onClick={handleCloseModal}>
					{t("cancelButton")}
				</Button>
				<Button className="font-semibold py-3 px-4 bg-gray-700 w-auto" onClick={handleCloseModal} variant="filled">
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};
