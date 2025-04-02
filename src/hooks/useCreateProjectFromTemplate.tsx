import { useState } from "react";

import { dump, load } from "js-yaml";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { defaultOpenedProjectFile, namespaces } from "@constants";
import { LoggerService, templateStorage } from "@services";
import { TourId } from "@src/enums";
import { useFileOperations } from "@src/hooks";
import { TemplateMetadata } from "@src/interfaces/store";

import { useProjectStore, useTemplatesStore, useToastStore } from "@store";

export const useCreateProjectFromTemplate = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });
	const { t: tActions } = useTranslation("dashboard", { keyPrefix: "actions" });
	const addToast = useToastStore((state) => state.addToast);
	const { createProjectFromManifest, getProjectsList, projectsList } = useProjectStore();
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
			const files = await templateStorage.getTemplateFiles(template.assetDirectory);
			const manifestData = files?.["autokitteh.yaml"];
			if (!manifestData) {
				addToast({
					message: tActions("projectCreationFailed"),
					type: "error",
				});

				LoggerService.error(
					namespaces.manifestService,
					`${t("projectCreationFailedExtended", { error: t("projectTemplateManifestNotFound") })}`
				);

				return;
			}

			const manifestObject = load(manifestData) as {
				project?: { name: string };
			};

			if (manifestObject && manifestObject.project && projectName) {
				manifestObject.project.name = projectName;
			}

			const updatedManifestData = dump(manifestObject);

			const { data: newProjectId, error } = await createProjectFromManifest(updatedManifestData);

			if (error || !newProjectId) {
				addToast({
					message: tActions("projectCreationFailed"),
					type: "error",
				});
				LoggerService.error(namespaces.manifestService, `${t("projectCreationFailedExtended", { error })}`);

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
					tourId: projectsList.length === 0 ? TourId.quickstart : undefined,
					...fileToOpen,
				},
			});
		} catch (error) {
			addToast({
				message: tActions("projectCreationFailed"),
				type: "error",
			});

			LoggerService.error(namespaces.manifestService, `${t("projectCreationFailedExtended", { error })}`);
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

	return { createProjectFromAsset, isCreating };
};
