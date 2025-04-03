import { useState } from "react";

import { dump } from "js-yaml";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { defaultOpenedProjectFile, namespaces } from "@constants";
import { LoggerService, templateStorage } from "@services";
import { useFileOperations } from "@src/hooks";
import { TemplateMetadata } from "@src/interfaces/store";
import { parseTemplateManifestAndFiles } from "@src/utilities";

import { useProjectStore, useTemplatesStore, useToastStore } from "@store";

export const useCreateProjectFromTemplate = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });
	const { t: tActions } = useTranslation("dashboard", { keyPrefix: "actions" });
	const addToast = useToastStore((state) => state.addToast);
	const { createProjectFromManifest, getProjectsList } = useProjectStore();
	const navigate = useNavigate();
	const { findTemplateByAssetDirectory } = useTemplatesStore();
	const [isCreating, setIsCreating] = useState(false);

	const { saveAllFiles } = useFileOperations("");

	const createProjectFromTemplate = async (
		template: TemplateMetadata,
		projectName?: string,
		fileNameToOpen?: string
	) => {
		try {
			const templateData = await parseTemplateManifestAndFiles(
				template.assetDirectory,
				templateStorage,
				projectName
			);

			if (!templateData) {
				addToast({
					message: tActions("projectCreationFailed"),
					type: "error",
				});

				LoggerService.error(
					namespaces.manifestService,
					t("projectCreationFailedExtended", { error: t("projectTemplateManifestNotFound") })
				);

				return;
			}

			const { manifest, files } = templateData;

			const updatedManifestData = dump(manifest);

			const { data: newProjectId, error } = await createProjectFromManifest(updatedManifestData);

			if (error || !newProjectId) {
				addToast({
					message: tActions("projectCreationFailed"),
					type: "error",
				});
				LoggerService.error(namespaces.manifestService, t("projectCreationFailedExtended", { error }));

				return;
			}

			LoggerService.info(
				namespaces.hooks.createProjectFromTemplate,
				tActions("projectCreatedSuccessfullyExtended", {
					templateName: template.title,
					projectId: newProjectId,
				})
			);

			await saveAllFiles(
				Object.fromEntries(
					Object.entries(files).map(([path, content]) => [
						path,
						new Uint8Array(new TextEncoder().encode(content)),
					])
				),
				newProjectId
			);

			addToast({
				message: tActions("projectCreatedSuccessfully"),
				type: "success",
			});

			getProjectsList();
			const fileToOpen = files?.[defaultOpenedProjectFile]
				? { fileToOpen: fileNameToOpen || defaultOpenedProjectFile }
				: {};

			navigate(`/projects/${newProjectId}`, {
				state: {
					...fileToOpen,
				},
			});
		} catch (error) {
			addToast({
				message: tActions("projectCreationFailed"),
				type: "error",
			});

			LoggerService.error(namespaces.manifestService, t("projectCreationFailedExtended", { error }));
		}
	};

	const createProjectFromAsset = async (
		templateAssetDirectory: string,
		projectName?: string,
		fileNameToOpen?: string
	) => {
		setIsCreating(true);
		try {
			const template = findTemplateByAssetDirectory(templateAssetDirectory);
			if (!template) {
				addToast({
					message: tActions("templateNotFoundInTheResources"),
					type: "error",
				});
				LoggerService.error(
					namespaces.resourcesService,
					tActions("templateNotFoundInTheResourcesExtended", { templateAssetDirectory })
				);

				return;
			}
			await createProjectFromTemplate(template, projectName, fileNameToOpen);
		} catch (error) {
			addToast({
				message: tActions("projectCreationFailed"),
				type: "error",
			});

			LoggerService.error(namespaces.resourcesService, t("projectCreationFailedExtended", { error }));
		} finally {
			setIsCreating(false);
		}
	};

	return { createProjectFromAsset, isCreating, createProjectFromTemplate };
};
