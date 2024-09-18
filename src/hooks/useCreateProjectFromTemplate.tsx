import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { findTemplateFilesByAssetDirectory, namespaces } from "@constants";
import { LoggerService } from "@services";
import { useFileOperations } from "@src/hooks";
import { fetchAllFilesContent, fetchFileContent } from "@src/utilities";

import { useProjectStore, useToastStore } from "@store";

export const useCreateProjectFromTemplate = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });
	const addToast = useToastStore((state) => state.addToast);
	const { createProjectFromManifest, getProjectsList } = useProjectStore();
	const navigate = useNavigate();

	const [projectId, setProjectId] = useState<string | null>(null);
	const [assetDirectory, setAssetDirectory] = useState<string | null>(null);

	const { saveAllFiles } = useFileOperations(projectId || "");

	useEffect(() => {
		const getAndSaveFiles = async () => {
			if (!projectId || !assetDirectory) return;

			const filesPerProject = await findTemplateFilesByAssetDirectory(assetDirectory);

			if (!filesPerProject) {
				addToast({
					message: t("projectTemplateFilesNotFound"),
					type: "error",
				});

				LoggerService.error(namespaces.manifestService, `${t("projectTemplateFilesNotFound")}`);

				return;
			}

			const filesData = await fetchAllFilesContent(`/assets/templates/${assetDirectory}/`, filesPerProject);

			await saveAllFiles(filesData);

			addToast({
				message: t("projectCreatedSuccessfully"),
				type: "success",
			});

			getProjectsList();

			navigate(`/projects/${projectId}/connections`);
		};

		getAndSaveFiles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const createProject = async (assetDir: string) => {
		try {
			const manifestURL = `/assets/templates/${assetDir}/autokitteh.yaml`;
			const manifestData = await fetchFileContent(manifestURL);

			if (!manifestData) {
				addToast({
					message: t("projectCreationFailed"),
					type: "error",
				});

				LoggerService.error(
					namespaces.manifestService,
					`${t("projectCreationFailedExtended", { error: t("projectTemplateManifestNotFound") })}`
				);

				return;
			}

			const { data: newProjectId, error } = await createProjectFromManifest(manifestData);

			if (error || !newProjectId) {
				addToast({
					message: t("projectCreationFailed"),
					type: "error",
				});
				LoggerService.error(namespaces.manifestService, `${t("projectCreationFailedExtended", { error })}`);

				return;
			}

			setProjectId(newProjectId);
			setAssetDirectory(assetDir);
		} catch (error) {
			addToast({
				message: t("projectCreationFailed"),
				type: "error",
			});

			LoggerService.error(namespaces.manifestService, `${t("projectCreationFailedExtended", { error })}`);
		}
	};

	return { createProject };
};
