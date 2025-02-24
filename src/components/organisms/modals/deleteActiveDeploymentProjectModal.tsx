import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { DeleteModalProps } from "@interfaces/components";

import { useModalStore } from "@store";

import { Button, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteActiveDeploymentProjectModal = ({ isDeleting, onDelete }: DeleteModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteProject" });
	const { closeModal } = useModalStore();

	return (
		<Modal hideCloseButton name={ModalName.deleteWithActiveDeploymentProject}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>
				<p className="mb-2 font-semibold">
					<div className="mr-2 inline text-lg">⚠️</div>
					{t("descriptionDeleteWithActiveDeployment1")}
				</p>
				<p>{t("descriptionDeleteWithActiveDeployment2")}</p>
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancelButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.deleteWithActiveDeploymentProject)}
					variant="outline"
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("deleteButton")}
					className="bg-gray-1100 px-4 py-3 font-semibold hover:bg-error"
					disabled={isDeleting}
					onClick={onDelete}
					variant="filled"
				>
					{isDeleting ? (
						<div className="flex flex-row gap-2">
							<Loader size="sm" />
							{t("deleteButton")}
						</div>
					) : (
						t("deleteButton")
					)}
				</Button>
			</div>
		</Modal>
	);
};
