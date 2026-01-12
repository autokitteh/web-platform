import { useEffect, useMemo, useState } from "react";

import { dump, load } from "js-yaml";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { DeploymentsService, LoggerService } from "@services";
import {
	namespaces,
	defaultProjectFile,
	defaultOpenedProjectFile,
	defaultManifestFileName,
	optionalManifestFileName,
} from "@src/constants";
import { ModalName } from "@src/enums/components";
import { fileOperations } from "@src/factories";
import { Manifest } from "@src/interfaces/models";
import { FileStructure } from "@src/interfaces/utilities";
import { navigateToProject, unpackFileZip, UserTrackingUtils } from "@src/utilities";

import { useConnectionStore, useModalStore, useProjectStore, useToastStore } from "@store";

import { ImportProjectModal, NewProjectModal } from "@components/organisms";
// Shared ref across all hook instances - singleton pattern
const fileInputRef = { current: null as HTMLInputElement | null };

export const useProjectActions = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "actions" });
	const { t: tUtil } = useTranslation("utilities", { keyPrefix: "fetchAndExtract" });
	const {
		createProject,
		createProjectFromManifest,
		deleteProject: removeProject,
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
	const { closeModal, modals: modalsState, openModal } = useModalStore();

	const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
	const [loadingImportFile, setLoadingImportFile] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [projectId, setProjectId] = useState<string>();
	const { saveAllFiles } = fileOperations(projectId!);
	const [templateFiles, setTemplateFiles] = useState<FileStructure>();
	const { resetChecker } = useConnectionStore();

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

		if (projectId) {
			UserTrackingUtils.trackEvent("project_created", {
				projectId,
				projectName: name,
			});
		}

		if (projectId) {
			navigateToProject(navigate, projectId, "/explorer/settings", { fileToOpen: defaultProjectFile });
		}

		return { error: false };
	};

	useEffect(() => {
		const getAndSaveFiles = async () => {
			if (!projectId || !templateFiles) return;

			const fileEntries = Object.entries(templateFiles).map(([path, fileNode]) => {
				const content = "content" in fileNode ? fileNode.content : "";

				return [path, new Uint8Array(new TextEncoder().encode(content.toString()))];
			});
			const fileReadme = fileEntries.some(([path]) => path === defaultOpenedProjectFile);

			await saveAllFiles(Object.fromEntries(fileEntries), projectId);
			addToast({
				message: t("projectCreatedSuccessfully"),
				type: "success",
			});

			getProjectsList();

			const fileToOpen = fileReadme ? { fileToOpen: defaultOpenedProjectFile } : undefined;
			navigateToProject(
				navigate,
				projectId,
				"/explorer/settings",
				fileToOpen ? { fileToOpen: fileToOpen.fileToOpen } : undefined
			);
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
			const manifestFileNode = structure[defaultManifestFileName];
			const manifestContent = manifestFileNode && "content" in manifestFileNode ? manifestFileNode.content : null;

			if (!manifestContent) {
				addToast({ message: t("projectManifestNotFoundInArchive"), type: "error" });
				LoggerService.error(
					namespaces.manifestService,
					`${t("projectManifestNotFoundInArchiveExtended", { error: t("projectContentNotFound"), archiveName: zipFile.name })}`
				);

				return null;
			}

			delete structure[defaultManifestFileName];
			delete structure[`${defaultManifestFileName}.user`];
			delete structure[defaultManifestFileName];
			delete structure[optionalManifestFileName];

			const manifest = load(manifestContent) as Manifest;

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
			const updatedManifestContent = dump(manifest);
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

	const handleImportFile = async (file: File, projectName: string) => {
		setLoadingImportFile(true);
		try {
			const parsedData = await extractManifestFromFiles(file);
			if (!parsedData) return;

			const { manifest, structure } = parsedData;
			if (manifest.project && projectName) {
				manifest.project.name = projectName;
			}

			if (projectNamesSet.has(manifest?.project?.name || "")) {
				setPendingFile(file);

				if (!modalsState[ModalName.importProject]) openModal(ModalName.importProject);

				return;
			}

			const newProjectId = await createProjectWithManifest(manifest, structure);
			if (newProjectId) setProjectId(newProjectId);
		} finally {
			setLoadingImportFile(false);
			if (modalsState[ModalName.importProject]) {
				closeModal(ModalName.importProject);
				setPendingFile(undefined);
			}
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	const downloadProjectExport = async (projectId: string) => {
		setIsExporting(true);

		const { data: akProjectArchiveZip, error: exportError } = await exportProject(projectId);

		if (exportError) {
			addToast({
				message: t("errorExportingProject"),
				type: "error",
			});
			setIsExporting(false);

			return null;
		}

		const blob = new Blob([akProjectArchiveZip! as BlobPart], { type: "application/zip" });
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

	const deleteProject = async (projectId: string) => {
		if (!projectId) {
			return { error: false };
		}

		resetChecker(undefined, true);

		setIsDeleting(true);
		const { error, data: projectName } = await removeProject(projectId);
		setTimeout(() => {
			setIsDeleting(false);
		}, 3000);
		if (error) {
			return { error };
		}

		return { error: false, projectName };
	};

	const deactivateDeployment = async (deploymentId: string) => {
		const { error } = await DeploymentsService.deactivate(deploymentId);

		if (error) {
			return { error };
		}

		const { error: errorDeploymentById, data: deploymentById } = await DeploymentsService.getById(deploymentId);

		if (errorDeploymentById) {
			return { error };
		}

		return { error: false, deploymentById };
	};

	const duplicateProject = async (projectId: string, newProjectName: string) => {
		if (!projectId || !newProjectName) {
			return { error: t("errorDuplicatingProject") };
		}

		try {
			const { data: akProject, error: exportError } = await exportProject(projectId);

			if (exportError) {
				return { error: t("errorExportingProject") };
			}

			const parsedData = await extractManifestFromFiles(
				new File([akProject! as BlobPart], `${newProjectName}.zip`)
			);
			if (!parsedData) {
				return { error: t("errorExtractingManifest") };
			}

			const { manifest, structure } = parsedData;
			if (manifest.project) {
				manifest.project.name = newProjectName;
			}

			const newProjectId = await createProjectWithManifest(manifest, structure);
			if (!newProjectId) {
				return { error: t("errorCreatingProject") };
			}

			const fileEntries = Object.entries(structure).map(([path, fileNode]) => {
				const content = "content" in fileNode ? fileNode.content : "";
				return [path, new Uint8Array(new TextEncoder().encode(content))];
			});
			await saveAllFiles(Object.fromEntries(fileEntries), newProjectId);

			await getProjectsList();

			return { error: false, newProjectId };
		} catch (error) {
			LoggerService.error(namespaces.projectUI, `${t("errorDuplicatingProjectExtended", { error })}`);
			return { error: t("errorDuplicatingProject") };
		}
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const FileInputElement = () => (
		<input
			accept=".zip"
			className="hidden"
			data-testid="import-project-file-input"
			onChange={(event) => handleImportFile(event.target.files![0], "")}
			ref={fileInputRef}
			type="file"
		/>
	);

	return {
		isCreatingNewProject,
		loadingImportFile,
		projectId,
		templateFiles,
		isExporting,
		deleteProject,
		isDeleting,
		downloadProjectExport,
		handleCreateProject,
		handleImportFile,
		deactivateDeployment,
		pendingFile,
		duplicateProject,
		triggerFileInput,
		FileInputElement, // Keep for global mounting
		ImportProjectModal,
		NewProjectModal,
	};
};
