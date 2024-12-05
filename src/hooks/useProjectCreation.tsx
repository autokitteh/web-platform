import { useEffect, useMemo, useRef, useState } from "react";

import yaml from "js-yaml";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { LoggerService } from "@services";
import { defaultProjectFile, namespaces } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { useFileOperations } from "@src/hooks";
import { Manifest } from "@src/interfaces/models";
import { FileStructure } from "@src/interfaces/utilities";
import { unpackFileZip } from "@src/utilities";

import { useModalStore, useProjectStore, useToastStore } from "@store";

export const useProjectCreationAndExport = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });
	const { t: tExport } = useTranslation("dashboard", { keyPrefix: "export" });
	const { t: tUtil } = useTranslation("utilities", { keyPrefix: "fetchAndExtract" });
	const {
		createProject,
		createProjectFromManifest,
		exportProject,
		getProject,
		getProjectsList,
		pendingFile,
		projectsList,
		setPendingFile,
	} = useProjectStore();
	const projectNamesSet = useMemo(() => new Set(projectsList.map((project) => project.name)), [projectsList]);
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const { closeModal, openModal } = useModalStore();

	const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
	const [loadingImportFile, setLoadingImportFile] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [projectId, setProjectId] = useState<string>();
	const { saveAllFiles } = useFileOperations(projectId || "");
	const [templateFiles, setTemplateFiles] = useState<FileStructure>();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleCreateProject = async (name: string) => {
		setIsCreatingNewProject(true);
		const { data, error } = await createProject(name, true);
		setIsCreatingNewProject(false);

		if (error) {
			addToast({
				message: t("errorCreatingProject"),
				type: "error",
			});

			return { error: true };
		}
		const projectId = data?.projectId;
		navigate(`/projects/${projectId}`, {
			state: { fileToOpen: defaultProjectFile },
		});

		return { error: false };
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

	const extractManifestFromFiles = async (
		zipFile: File
	): Promise<{ manifest: Manifest; structure: FileStructure } | null> => {
		try {
			const { error, structure } = await unpackFileZip(zipFile);
			if (error) {
				addToast({ message: tUtil("uknownErrorUnpackingZip", { zipName: zipFile.name }), type: "error" });

				return null;
			}
			if (!structure) return null;
			const manifestFileNode = structure["autokitteh.yaml"];
			const manifestContent = manifestFileNode && "content" in manifestFileNode ? manifestFileNode.content : null;

			if (!manifestContent) {
				addToast({ message: t("projectManifestNotFoundInArchive"), type: "error" });
				LoggerService.error(
					namespaces.manifestService,
					`${t("projectManifestNotFoundInArchiveExtended", { error: t("projectContentNotFound"), archiveName: zipFile.name })}`
				);

				return null;
			}

			delete structure["autokitteh.yaml"];
			delete structure["autokitteh.yaml.user"];

			const manifest = yaml.load(manifestContent) as Manifest;

			return { structure, manifest };
		} catch (error) {
			addToast({ message: t("projectCreationFailed"), type: "error" });
			LoggerService.error(
				namespaces.manifestService,
				`${t("projectManifestExtractionFailedExtended", { error })}`
			);

			return null;
		}
	};

	const createProjectWithManifest = async (manifest: any, structure: FileStructure): Promise<string | null> => {
		try {
			const updatedManifestContent = yaml.dump(manifest);
			const { data: newProjectId, error } = await createProjectFromManifest(updatedManifestContent);

			if (error || !newProjectId) {
				addToast({ message: t("projectCreationFailed"), type: "error" });
				LoggerService.error(namespaces.manifestService, `${t("projectCreationFailedExtended", { error })}`);

				return null;
			}

			setTemplateFiles(structure);

			return newProjectId;
		} catch (error) {
			addToast({ message: t("projectCreationFailed"), type: "error" });
			LoggerService.error(namespaces.manifestService, `${t("projectCreationFailedExtended", { error })}`);

			return null;
		}
	};

	const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files![0];

		setLoadingImportFile(true);
		try {
			const parsedData = await extractManifestFromFiles(file);
			if (!parsedData) return;

			const { manifest, structure } = parsedData;

			if (manifest.project && projectNamesSet.has(manifest.project.name)) {
				setPendingFile(file);
				openModal(ModalName.importProject);

				return;
			}

			const newProjectId = await createProjectWithManifest(manifest, structure);
			if (newProjectId) setProjectId(newProjectId);
		} finally {
			setLoadingImportFile(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const completeImportWithNewName = async (newName: string) => {
		if (!pendingFile) return;

		setLoadingImportFile(true);
		try {
			const parsedData = await extractManifestFromFiles(pendingFile);
			if (!parsedData) return;

			const { manifest, structure } = parsedData;
			if (manifest.project) {
				manifest.project.name = newName;
			}

			const newProjectId = await createProjectWithManifest(manifest, structure);
			if (newProjectId) setProjectId(newProjectId);
		} finally {
			setLoadingImportFile(false);
			closeModal(ModalName.importProject);
			setPendingFile(undefined);
		}
	};

	const downloadProjectExport = async (projectId: string) => {
		setIsExporting(true);

		const { data: akProjectArchiveZip, error: exportError } = await exportProject(projectId);

		if (exportError) {
			addToast({
				message: tExport("errorExportingProject"),
				type: "error",
			});
			setIsExporting(false);

			return null;
		}

		const blob = new Blob([akProjectArchiveZip!], { type: "application/zip" });
		const url = URL.createObjectURL(blob);

		const { data: project, error: getProjectError } = await getProject(projectId!);

		if (getProjectError) {
			return { error: getProjectError };
		}

		const now = new Date();
		const dateTime = now
			.toLocaleString("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			})
			.replace(/[/:]/g, "")
			.replace(", ", "-");

		const fileName = `ak-${project?.name}-${dateTime}-archive.zip`;
		const link = Object.assign(document.createElement("a"), {
			href: url,
			download: fileName,
		});

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		setIsExporting(false);
	};

	return {
		isCreatingNewProject,
		loadingImportFile,
		projectId,
		templateFiles,
		fileInputRef,
		isExporting,
		downloadProjectExport,
		handleCreateProject,
		handleImportFile,
		completeImportWithNewName,
	};
};
