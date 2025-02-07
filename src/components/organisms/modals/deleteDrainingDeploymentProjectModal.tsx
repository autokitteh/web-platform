import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";

import { useModalStore } from "@store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteDrainingDeploymentProjectModal = () => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteProject" });
	const { closeModal } = useModalStore();

	return (
		<Modal hideCloseButton name={ModalName.deleteWithDrainingDeploymentProject}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>
				<p>{t("tryDeleteProjectAfterChangeStatus")}</p>
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("okButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.deleteWithDrainingDeploymentProject)}
					variant="outline"
				>
					{t("okButton")}
				</Button>
			</div>
		</Modal>
	);
};
