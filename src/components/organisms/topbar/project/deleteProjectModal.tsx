import React, { useEffect, useState } from "react";

import { Trans, useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { ModalDeleteTriggerProps } from "@interfaces/components";
import { ProjectsService } from "@services";
import { Project } from "@type/models";

import { useModalStore } from "@store";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";

export const DeleteProjectModal = ({ onDelete }: ModalDeleteTriggerProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "deleteProject" });
	const { closeModal } = useModalStore();
	const { projectId } = useParams();
	const [project, setProject] = useState<Project>();

	const fetchProject = async () => {
		if (!projectId) {
			return;
		}
		const { data } = await ProjectsService.get(projectId);
		if (!data) {
			return;
		}
		setProject(data);
	};

	useEffect(() => {
		fetchProject();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	return (
		<Modal name={ModalName.deleteProject}>
			<div className="mx-6">
				<h3 className="mb-5 text-xl font-bold">{t("title", { name: project?.name })}</h3>

				<div className="font-medium">
					<Trans
						i18nKey="line"
						t={t}
						values={{
							name: project?.name,
							projectId,
						}}
					/>
				</div>

				<p className="mt-2">{t("line2")}</p>
			</div>

			<div className="mt-10 flex justify-end gap-1">
				<Button
					className="w-auto px-4 py-3 font-semibold hover:text-white"
					onClick={() => closeModal(ModalName.deleteProject)}
				>
					{t("cancelButton")}
				</Button>

				<Button className="w-auto bg-gray-700 px-4 py-3 font-semibold" onClick={onDelete} variant="filled">
					{t("deleteButton")}
				</Button>
			</div>
		</Modal>
	);
};
