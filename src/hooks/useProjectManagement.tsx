import { useEffect, useRef, useState } from "react";

import yaml from "js-yaml";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { useFileOperations } from "@src/hooks";
import { FileStructure } from "@src/interfaces/utilities";
import { unpackFileZip } from "@src/utilities";

import { useProjectStore, useToastStore } from "@store";

export const useProjectManagement = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });
	const { createProject, createProjectFromManifest, getProjectsList } = useProjectStore();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);

	const [loadingNewProject, setLoadingNewProject] = useState(false);
	const [loadingImportFile, setLoadingImportFile] = useState(false);
	const [projectId, setProjectId] = useState<string>();
	const { saveAllFiles } = useFileOperations(projectId || "");
	const [templateFiles, setTemplateFiles] = useState<FileStructure>();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleCreateProject = async () => {
		setLoadingNewProject(true);
		const { data, error } = await createProject(true);
		setLoadingNewProject(false);

		if (error) {
			addToast({
				message: (error as Error).message,
				type: "error",
			});

			return;
		}

		const projectId = data?.projectId;
		navigate(`/projects/${projectId}`, {
			state: { fileToOpen: "README.md" },
		});
	};

	useEffect(() => {
		const getAndSaveFiles = async () => {
			if (!projectId || !templateFiles) return;

			const fileEntries = Object.entries(templateFiles).map(([path, fileNode]) => {
				const content = "content" in fileNode ? fileNode.content : "";

				return [path, new Uint8Array(new TextEncoder().encode(content))];
			});

			await saveAllFiles(Object.fromEntries(fileEntries));
			addToast({
				message: t("projectCreatedSuccessfully"),
				type: "success",
			});

			getProjectsList();
			navigate(`/projects/${projectId}`);
		};

		getAndSaveFiles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		setLoadingImportFile(true);

		try {
			const { structure } = await unpackFileZip(file);
			if (!structure) return;

			const manifestFileNode = structure["autokitteh.yaml"];
			const manifestContent = manifestFileNode && "content" in manifestFileNode ? manifestFileNode.content : null;
			if (!manifestContent) {
				addToast({
					message: t("projectContentError"),
					type: "error",
				});

				LoggerService.error(
					namespaces.manifestService,
					`${t("projectContentErrorExtended", { error: t("projectContentNotFound") })}`
				);

				return;
			}

			const manifest = yaml.load(manifestContent);
			const updatedManifestContent = yaml.dump(manifest);

			const { data: newProjectId, error } = await createProjectFromManifest(updatedManifestContent);
			if (error || !newProjectId) {
				addToast({
					message: t("projectCreationFailed"),
					type: "error",
				});
				LoggerService.error(namespaces.manifestService, `${t("projectCreationFailedExtended", { error })}`);

				return;
			}

			delete structure["autokitteh.yaml"];
			delete structure["autokitteh.yaml.user"];

			setProjectId(newProjectId);
			setTemplateFiles(structure);
		} catch (error) {
			addToast({
				message: t("projectCreationFailed"),
				type: "error",
			});

			LoggerService.error(namespaces.manifestService, `${t("projectCreationFailedExtended", { error })}`);
		} finally {
			setLoadingImportFile(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	return {
		loadingNewProject,
		loadingImportFile,
		projectId,
		templateFiles,
		fileInputRef,
		handleCreateProject,
		handleImportFile,
	};
};
