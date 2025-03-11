import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { ProjectTemplateCreateModal } from "./createModal";
import { ModalName } from "@enums/components";
import { ProjectTemplateCreateContainerProps } from "@interfaces/components";
import { useTemplateCreation } from "@src/hooks";
import { useModalStore, useTemplatesStore, useToastStore } from "@src/store";

export const ProjectTemplateCreateModalContainer = ({ template }: ProjectTemplateCreateContainerProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "createProjectModalWrapper" });
	const [readme, setReadme] = useState<string>(t("noReadmeAvailable"));
	const { closeModal } = useModalStore();
	const { getFilesForTemplate } = useTemplatesStore();
	const { createNamedTemplate, projectNamesList, isCreating } = useTemplateCreation();

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
			await createNamedTemplate(template.assetDirectory, projectName);
			closeModal(ModalName.templateCreateProject);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			addToast({
				message: "Project creation failed",
				type: "error",
			});
		}
	};

	const handleCancel = () => {
		closeModal(ModalName.templateCreateProject);
	};

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
