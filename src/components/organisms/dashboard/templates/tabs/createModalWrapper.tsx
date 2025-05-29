import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { ProjectTemplateCreateModal } from "./createModal";
import { ModalName } from "@enums/components";
import { ProjectTemplateCreateContainerProps } from "@interfaces/components";
import { useCreateProjectFromTemplate } from "@src/hooks";
import { useModalStore, useProjectStore, useTemplatesStore, useToastStore } from "@src/store";

export const ProjectTemplateCreateModalContainer = ({ template }: ProjectTemplateCreateContainerProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "createProjectModalWrapper" });
	const [readme, setReadme] = useState<string>(t("noReadmeAvailable"));
	const { closeModal } = useModalStore();
	const { getFilesForTemplate } = useTemplatesStore();
	const { createProjectFromAsset, isCreating } = useCreateProjectFromTemplate();
	const { projectsList } = useProjectStore();

	const addToast = useToastStore((state) => state.addToast);
	const [isReadmeLoading, setIsReadmeLoading] = useState(false);

	useEffect(() => {
		const fetchReadme = async () => {
			if (!template.assetDirectory) return;

			setIsReadmeLoading(true);
			try {
				const content = await getFilesForTemplate(template.assetDirectory);
				if (!content["README.md"]) {
					setReadme(t("noReadmeAvailable"));
					return;
				}

				const readmeContent = content["README.md"];
				const cleanedReadme = readmeContent.replace(/---[\s\S]*?---\n/, "");
				setReadme(cleanedReadme);
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (error) {
				addToast({
					message: t("failedReadmeFetch"),
					type: "error",
				});
				setReadme(t("failedReadmeFetch"));
			} finally {
				setIsReadmeLoading(false);
			}
		};

		fetchReadme();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [template.assetDirectory, getFilesForTemplate]);

	const handleSubmit = async (projectName: string) => {
		if (!template.assetDirectory || !projectName) return;

		try {
			await createProjectFromAsset(template.assetDirectory, projectName);
			closeModal(ModalName.templateCreateProject);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			addToast({
				message: t("projectCreationFailed"),
				type: "error",
			});
		}
	};

	const handleCancel = () => {
		closeModal(ModalName.templateCreateProject);
	};

	const projectNamesList = projectsList.map((project) => project.name);

	return (
		<ProjectTemplateCreateModal
			isCreating={isCreating}
			isReadmeLoading={isReadmeLoading}
			onCancel={handleCancel}
			onSubmit={handleSubmit}
			projectNamesList={projectNamesList}
			readme={readme}
			template={template}
		/>
	);
};
