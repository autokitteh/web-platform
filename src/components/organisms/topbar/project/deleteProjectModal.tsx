import React from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { ModalDeleteTriggerProps } from "@interfaces/components";

import { useProjectStore } from "@store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteProjectModal = ({ onDelete }: ModalDeleteTriggerProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteProject" });
	const { projectsList } = useProjectStore();
	const { projectId } = useParams();

	const projectName = projectsList.find(({ id }) => id === projectId)?.name;

	return (
		<Modal name={ModalName.deleteProject}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title")}</h3>
				<p>{t("content", { name: projectName })}</p>
			</div>

			<div className="flex w-full justify-end">
				<Button
					ariaLabel={t("deleteButton")}
					className="mt-8 bg-gray-1100 px-4 py-3 font-semibold"
					onClick={onDelete}
					variant="filled"
				>
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};
