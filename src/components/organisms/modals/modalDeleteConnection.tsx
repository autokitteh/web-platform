import React from "react";
import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { EModalName } from "@enums/components";
import { useModalStore } from "@store";
import { useTranslation } from "react-i18next";

export const ModalDeleteConnection = () => {
	const { t } = useTranslation("modals", { keyPrefix: "connection" });
	const { closeModal } = useModalStore();
	const handleCloseModal = () => closeModal(EModalName.deleteConnection);

	return (
		<Modal name={EModalName.deleteConnection}>
			<div className="mx-6">
				<h3 className="text-xl font-bold mb-5">{t("title")}</h3>
				<p>
					{t("desc")}
					<br />
					<strong> {t("desc2", { projects: 3, running: 2 })}</strong>
				</p>
				<br />
				<p>
					{t("desc3")} <br /> {t("desc4")}
				</p>
			</div>
			<div className="flex justify-end gap-1 mt-14">
				<Button className="font-semibold py-3 px-4 hover:text-white w-auto" onClick={handleCloseModal}>
					{t("cancel")}
				</Button>
				<Button className="font-semibold py-3 px-4 bg-gray-700 w-auto" onClick={handleCloseModal} variant="filled">
					{t("delete")}
				</Button>
			</div>
		</Modal>
	);
};
