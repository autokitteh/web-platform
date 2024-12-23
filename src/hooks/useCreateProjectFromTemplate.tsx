import { useEffect, useState } from "react";

import yaml from "js-yaml";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { useFileOperations } from "@src/hooks";
import { TemplateMetadata } from "@src/interfaces/store";

import { useProjectStore, useTemplatesStore, useToastStore } from "@store";

export const useCreateProjectFromTemplate = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });
	const { t: tActions } = useTranslation("dashboard", { keyPrefix: "actions" });
	const addToast = useToastStore((state) => state.addToast);
	const { createProjectFromManifest, getProjectsList } = useProjectStore();
	const navigate = useNavigate();
	const { findTemplateByAssetDirectory, templateStorage } = useTemplatesStore();
	const [isCreating, setIsCreating] = useState(false);

	const [projectId, setProjectId] = useState<string | null>(null);
	const [templateFiles, setTemplateFiles] = useState<Record<string, string>>();

	const { saveAllFiles } = useFileOperations(projectId || "");

	useEffect(() => {
		const getAndSaveFiles = async () => {
			if (!projectId || !templateFiles) return;

			await saveAllFiles(
				Object.fromEntries(
					Object.entries(templateFiles).map(([path, content]) => [
						path,
						new Uint8Array(new TextEncoder().encode(content)),
					])
				)
			);

			addToast({
				message: tActions("projectCreatedSuccessfully"),
				type: "success",
			});

			getProjectsList();
			navigate(`/projects/${projectId}`);
		};

		getAndSaveFiles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, templateFiles]);

	const createProjectFromTemplate = async (template: TemplateMetadata, projectName?: string) => {
		try {
			const files = await templateStorage?.getTemplateFiles(template.assetDirectory);
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

			const manifestObject = yaml.load(manifestData) as {
				project?: { name: string };
			};

			if (manifestObject && manifestObject.project && projectName) {
				manifestObject.project.name = projectName;
			}

			const updatedManifestData = yaml.dump(manifestObject);

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

			setProjectId(newProjectId);
			setTemplateFiles(files);
		} catch (error) {
			addToast({
				message: tActions("projectCreationFailed"),
				type: "error",
			});

			LoggerService.error(namespaces.manifestService, `${t("projectCreationFailedExtended", { error })}`);
		}
	};

	const createProjectFromAsset = async (templateAssetDirectory: string, projectName?: string) => {
		setIsCreating(true);
		try {
			const template = findTemplateByAssetDirectory(templateAssetDirectory);
			if (!template) {
				addToast({
					message: t("templateNotFoundInTheResources"),
					type: "error",
				});
				LoggerService.error(
					namespaces.resourcesService,
					t("templateNotFoundInTheResourcesExtended", { templateAssetDirectory })
				);

				return;
			}
			await createProjectFromTemplate(template, projectName);
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
