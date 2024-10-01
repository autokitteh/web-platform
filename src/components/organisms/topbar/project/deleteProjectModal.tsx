import React from "react";

import { Trans, useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { ModalDeleteTriggerProps } from "@interfaces/components";

import { useModalStore, useProjectStore } from "@store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteProjectModal = ({ onDelete }: ModalDeleteTriggerProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteProject" });
	const { closeModal } = useModalStore();
	const { projectsList } = useProjectStore();
	const { projectId } = useParams();

	const projectName = projectsList.find(({ id }) => id === projectId)?.name;

	return (
		<Modal name={ModalName.deleteProject}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>

				<div className="font-medium">
					<Trans
						i18nKey="line"
						t={t}
						values={{
							name: projectName,
							projectId,
						}}
					/>
				</div>

				<p>{t("line2")}</p>
			</div>

			<div className="mt-10 flex justify-end gap-1">
				<Button
					className="w-auto px-4 py-3 font-semibold hover:text-white"
					onClick={() => closeModal(ModalName.deleteProject)}
				>
					{t("cancelButton")}
				</Button>

				<Button className="w-auto px-4 py-3 font-semibold" onClick={onDelete} variant="filled">
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};
