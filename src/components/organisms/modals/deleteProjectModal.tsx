import React from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { DeleteModalProps } from "@interfaces/components";

import { useModalStore, useProjectStore } from "@store";

import { Button, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteProjectModal = ({ isDeleting, onDelete }: DeleteModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteProject" });
	const { projectId } = useParams();
	const { closeModal } = useModalStore();
	const { projectsList } = useProjectStore();
	const projectName = projectsList.find(({ id }) => id === projectId)?.name;
	const projectNameFromStore = useModalStore((state) => state.data as string);

	return (
		<Modal hideCloseButton name={ModalName.deleteProject}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>
				<p>{t("content", { name: projectName || projectNameFromStore })}</p>
				<p>{t("deleteWarning")}</p>
			</div>

			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancelButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.deleteProject)}
					variant="outline"
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("okButton")}
					className="min-w-20 justify-center bg-gray-1100 px-4 py-3 font-semibold hover:text-error"
					disabled={isDeleting}
					onClick={onDelete}
					variant="filled"
				>
					{isDeleting ? (
						<div className="flex flex-row gap-2">
							<Loader size="sm" />
							{t("okButton")}
						</div>
					) : (
						t("okButton")
					)}
				</Button>
			</div>
		</Modal>
	);
};
